const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  website: {
    type: String,
    required: true,
    trim: true,
    match: /^https?:\/\/[^\s$.?#].[^\s]*$/ // Validates basic URLs
  },
  courses: {
    type: [String],
    validate: courses => courses.length > 0 // At least one course is needed
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('College', collegeSchema);
