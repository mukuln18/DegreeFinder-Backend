const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    duration: { type: String },
    fees: { type: Number }
});

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String, required: true,
      trim: true
    },
    slug: {
      type: String ,unique: true
    },
    location: {
      type: String 
    },
    ranking: {
      type: Number
    },
    fees: {
      type: Number
    },
    placementPercentage: {
      type: Number
    },
    courses: [courseSchema],
    eligibility: {
      type: String
    },
    image: {
      type: String
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    },
    description: { type: String },

    website: { type: String }

  },
  { timestamps: true }
);

// Indexes( for optimized performance)
// collegeSchema.index({ slug: 1 });
collegeSchema.index({ name: 1 });
collegeSchema.index({ ranking: 1 });
collegeSchema.index({ fees: 1 });
collegeSchema.index({ placementPercentage: 1 });

const College = mongoose.model("College", collegeSchema);

module.exports = College;