const cloudinary = require('cloudinary').v2;
const Profile = require('../models/Profile');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { randomUUID } = require('node:crypto');
const { httpError } = require('../middleware/errors');

const cloudinaryConfigured = () =>
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

const safeCloudinaryError = (error) => {
  const message = error?.message || error?.error?.message || '';
  const secrets = [process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET, process.env.JWT_SECRET].filter(Boolean);
  return {
    name: error?.name || error?.error?.name || 'CloudinaryError',
    code: error?.code || error?.error?.code || '',
    httpCode: error?.http_code || error?.httpCode || error?.error?.http_code || '',
    message: secrets.reduce((safe, secret) => safe.split(secret).join('[redacted]'), String(message)),
  };
};

const cloudinaryFailureMessage = (details) => {
  if (/invalid cloud_name/i.test(details.message))
    return 'Cloudinary rejected CLOUDINARY_CLOUD_NAME. Set it to the exact cloud name shown in your Cloudinary dashboard.';
  if (details.httpCode === 401) return 'Cloudinary rejected its configured credentials. Please verify the Cloudinary account settings.';
  if (details.httpCode === 403)
    return 'Cloudinary denied asset creation. Check that the existing API key has upload/create permission for this product environment.';
  if (details.httpCode === 400) return 'Cloudinary rejected this file. Please check that it is a valid supported file.';
  return 'Cloudinary could not complete the upload. Please try again.';
};

const uploadCloud = (file, folder, resourceType, publicId) =>
  new Promise((resolve, reject) => {
    const options = { folder, resource_type: resourceType };
    if (publicId) Object.assign(options, { public_id: publicId, filename: file.originalname });
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => (error ? reject(error) : resolve(result)));
    stream.end(file.buffer);
  });

const getCloudinaryPublicId = (assetUrl, resourceType) => {
  try {
    const url = new URL(assetUrl);
    if (url.hostname !== 'res.cloudinary.com') return null;
    const uploadedPath = url.pathname.split('/upload/')[1];
    if (!uploadedPath) return null;
    const parts = uploadedPath.split('/').filter(Boolean);
    const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));
    const assetParts = versionIndex >= 0 ? parts.slice(versionIndex + 1) : parts;
    if (!assetParts.length) return null;
    assetParts[assetParts.length - 1] = decodeURIComponent(assetParts.at(-1));
    if (resourceType !== 'raw') assetParts[assetParts.length - 1] = assetParts.at(-1).replace(/\.[^.]+$/, '');
    return assetParts.join('/');
  } catch {
    return null;
  }
};

const deleteCloudAsset = async (publicId, resourceType) => {
  if (!publicId) return;
  if (!cloudinaryConfigured()) throw httpError(503, 'Cloudinary is not configured, so the uploaded file was not removed.');
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
    if (!['ok', 'not found'].includes(result.result)) throw new Error('Cloudinary did not confirm asset deletion.');
  } catch (error) {
    const details = safeCloudinaryError(error);
    console.error('Cloudinary asset removal failed:', details);
    throw httpError(502, 'Cloudinary could not remove this file. Your profile was left unchanged.');
  }
};

const removeCloudAsset = async (publicId, resourceType) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
  } catch {
    console.error('A temporary Cloudinary asset could not be removed after a failed save.');
  }
};

const getOrCreateProfile = async (userId) => {
  let profile = await Profile.findOne({ userId });
  if (!profile) {
    profile = await Profile.create({
      userId,
      headline: '',
      skills: [],
      experienceYears: 0,
      education: [],
      experience: [],
      resumes: [],
      savedJobs: [],
    });
  }
  return profile;
};

exports.uploadResume = async (req, res) => {
  const profile = await getOrCreateProfile(req.user._id);
  if (!cloudinaryConfigured()) throw httpError(503, 'Cloudinary is not configured. Add its credentials to server/.env.');

  let result;
  const extension = require('path').extname(req.file.originalname).toLowerCase();
  const cloudinaryPublicId = `${randomUUID()}${extension}`;

  try {
    result = await uploadCloud(req.file, 'hirespot/resumes', 'raw', cloudinaryPublicId);
  } catch (error) {
    const details = safeCloudinaryError(error);
    console.error('Cloudinary resume upload failed:', details);
    throw httpError(502, cloudinaryFailureMessage(details));
  }

  const resume = {
    _id: randomUUID(),
    originalName: req.file.originalname,
    url: result.secure_url,
    publicId: result.public_id,
    uploadedAt: new Date(),
  };

  profile.resumes.push(resume);
  try {
    await profile.save();
  } catch {
    profile.resumes = profile.resumes.filter((item) => item._id !== resume._id);
    await profile.save().catch(() => {});
    await removeCloudAsset(result.public_id, 'raw');
    throw httpError(500, 'The resume could not be saved. Please try again.');
  }

  res.status(201).json({ message: 'Resume uploaded', resumes: profile.resumes });
};

exports.uploadProfilePicture = async (req, res) => {
  const profile = await getOrCreateProfile(req.user._id);
  if (!cloudinaryConfigured()) throw httpError(503, 'Cloudinary is not configured. Add its credentials to server/.env.');

  let result;
  try {
    result = await uploadCloud(req.file, 'hirespot/profile-pictures', 'image');
  } catch (error) {
    const details = safeCloudinaryError(error);
    console.error('Cloudinary profile picture upload failed:', details);
    throw httpError(502, cloudinaryFailureMessage(details));
  }

  const previousPicture = profile.profilePicture;
  const previousPicturePublicId = profile.profilePicturePublicId;

  profile.profilePicture = result.secure_url;
  profile.profilePicturePublicId = result.public_id;

  try {
    await profile.save();
  } catch {
    profile.profilePicture = previousPicture || '';
    profile.profilePicturePublicId = previousPicturePublicId || '';
    await profile.save().catch(() => {});
    await removeCloudAsset(result.public_id, 'image');
    throw httpError(500, 'The profile picture could not be saved. Please try again.');
  }

  if (req.user.role === 'admin' && previousPicture) {
    await removeCloudAsset(previousPicturePublicId || getCloudinaryPublicId(previousPicture, 'image'), 'image');
  }

  res.json({ message: 'Profile picture uploaded', profilePicture: profile.profilePicture });
};

exports.removeResume = async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user._id });
  const resumeIndex = profile?.resumes.findIndex((item) => item._id === req.params.id) ?? -1;
  if (!profile || resumeIndex < 0) throw httpError(404, 'Resume not found');

  const resume = profile.resumes[resumeIndex];
  const publicId = resume.publicId || getCloudinaryPublicId(resume.url, 'raw');
  await deleteCloudAsset(publicId, 'raw');

  profile.resumes.splice(resumeIndex, 1);
  await profile.save();

  const completion = [
    profile.headline,
    profile.skills?.length,
    profile.education?.length,
    profile.experience?.length,
    profile.resumes?.length,
  ].filter(Boolean).length * 20;

  res.json({ message: 'Resume removed', resumes: profile.resumes, completion });
};

exports.removeProfilePicture = async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user._id });
  if (!profile?.profilePicture) throw httpError(404, 'Profile picture not found');

  const publicId = profile.profilePicturePublicId || getCloudinaryPublicId(profile.profilePicture, 'image');
  await deleteCloudAsset(publicId, 'image');

  profile.profilePicture = '';
  profile.profilePicturePublicId = '';
  await profile.save();

  res.json({ message: 'Profile picture removed' });
};

exports.downloadResume = async (req, res) => {
  const profile = await Profile.findOne({ 'resumes._id': req.params.id }).lean();
  const resume = profile?.resumes?.find((r) => r._id === req.params.id);
  if (!resume) throw httpError(404, 'File not found');

  let allowed = profile.userId === req.user._id;
  if (!allowed && req.user.role === 'recruiter') {
    const jobApp = await Application.findOne({ resumeId: resume._id });
    if (jobApp) {
      const job = await Job.findOne({ _id: jobApp.jobId, recruiterId: req.user._id });
      if (job) allowed = true;
    }
  }
  if (!allowed) throw httpError(403, 'You cannot access this file');

  res.redirect(resume.url);
};
