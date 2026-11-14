const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');

const jobSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    workMode: {
      type: String,
      enum: ['onsite', 'hybrid', 'remote'],
      default: 'onsite',
    },
    skills: {
      type: [String],
      default: [],
    },
    minExp: {
      type: Number,
      default: 0,
      min: 0,
    },
    ctcRange: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
    },
    deadline: {
      type: Date,
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    recruiterId: {
      type: String,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'closed', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

jobSchema.index({ status: 1, deadline: 1 });
jobSchema.index({ recruiterId: 1 });

module.exports = mongoose.model('Job', jobSchema);
