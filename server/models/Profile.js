const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');

const resumeSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  }
);

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      default: '',
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    expectedCtc: {
      type: mongoose.Schema.Types.Mixed,
      default: '',
    },
    education: {
      type: [
        {
          degree: String,
          institution: String,
          year: String,
        },
      ],
      default: [],
    },
    experience: {
      type: [
        {
          company: String,
          position: String,
          duration: String,
        },
      ],
      default: [],
    },
    resumes: {
      type: [resumeSchema],
      default: [],
    },
    savedJobs: {
      type: [String],
      ref: 'Job',
      default: [],
    },
    profilePicture: {
      type: String,
      default: '',
    },
    profilePicturePublicId: {
      type: String,
      default: '',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', profileSchema);
