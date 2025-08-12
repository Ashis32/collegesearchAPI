const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['superadmin', 'editor', 'viewer'], // set your own roles
    default: 'editor' // choose the default role for new admins
  }
});

module.exports = mongoose.model('Admin', adminSchema);
