
const cors = require('cors');

const Admin = require('./Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'yourSecretKey'; // Replace with a strong secret or use env vars!
const requireRole = require('./requireRole');
const mongoose = require('mongoose');
const express = require('express');




const uri = 'mongodb+srv://Ashis100:Ashis100@cluster0.hxny8p0.mongodb.net/college?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('College API is running!');
});

const College = require('./College');

// Add a new college (open for now — later, you'll secure this!)
app.post('/colleges', requireRole(['editor', 'superadmin']), async (req, res) => {
    try {
      const college = new College(req.body);
      await college.save();
      res.status(201).json({ message: 'College added', college });
    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  });
  app.get('/colleges', async (req, res) => {
    const colleges = await College.find();
    res.json(colleges);
  });
  
  
// Get a specific college by its MongoDB _id
app.get('/colleges/:id', async (req, res) => {
    try {
      const college = await College.findById(req.params.id);
      if (!college) {
        return res.status(404).json({ message: 'College not found' });
      }
      res.json(college);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
// Update an existing college by its _id
app.put('/colleges/:id', async (req, res) => {
    try {
      const updatedCollege = await College.findByIdAndUpdate(
        req.params.id,
        req.body,              // the new data
        { new: true }          // return the updated document
      );
  
      if (!updatedCollege) {
        return res.status(404).json({ message: 'College not found' });
      }
      res.json({ message: 'College updated', college: updatedCollege });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });    

  // Delete a college by its _id
  app.delete('/colleges/:id', requireRole(['superadmin']), async (req, res) => {
    try {
      const deletedCollege = await College.findByIdAndDelete(req.params.id);
      if (!deletedCollege) {
        return res.status(404).json({ message: 'College not found' });
      }
      res.json({ message: 'College deleted', college: deletedCollege });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  // Search/filter colleges by query
  app.get('/search', async (req, res) => {
    try {
      const { name, location, course } = req.query;
      const query = {};
      if (name) query.name = { $regex: name, $options: 'i' };
      if (location) query.location = { $regex: location, $options: 'i' };
      if (course) query.courses = { $in: [course] };
  
      const colleges = await College.find(query);
      res.json(colleges);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  


// Admin signup
app.post('/admin/signup', async (req, res) => {
    try {
      const { email, password, role } = req.body;
      let admin = await Admin.findOne({ email });
      if (admin) return res.status(400).json({ message: 'Admin already exists' });
      const hashedPassword = await bcrypt.hash(password, 10);
      admin = new Admin({ email, password: hashedPassword, role: role || 'editor' });
      await admin.save();
      res.status(201).json({ message: 'Admin registered', admin: { email: admin.email, role: admin.role } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  



// Admin login
app.post('/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email });
      if (!admin) return res.status(400).json({ message: 'Invalid credentials' });
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
      const token = jwt.sign(
        { adminId: admin._id, role: admin.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token, role: admin.role });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

function auth(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.adminId = decoded.adminId;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  }
  

  app.post('/colleges', auth, async (req, res) => { /* ... */ });
  app.put('/colleges/:id', auth, async (req, res) => { /* ... */ });
  app.delete('/colleges/:id', auth, async (req, res) => { /* ... */ });
  

app.listen(3000, () => {
  console.log('API server running at http://localhost:3000');
});
