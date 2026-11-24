const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');

const applicationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    jobId: {
      type: String,
      ref: 'Job',
      required: true,
    },
    candidateId: {
      type: String,
      ref: 'User',
      required: true,
    },
    resumeId: {
      type: String,
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    coverNote: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    stage: {
      type: String,
      enum: ['applied', 'shortlisted', 'interview', 'offered', 'rejected'],
      default: 'applied',
    },
    stageHistory: [
      {
        stage: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    recruiterNotes: [
      {
        _id: { type: String, default: () => randomUUID() },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
applicationSchema.index({ candidateId: 1 });
applicationSchema.index({ jobId: 1 });

module.exports = mongoose.model('Application', applicationSchema);
