// Imports
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauce');

// Create an Express app
const app = express();

app.use(express.json());

// Connect app to MongoDB database
mongoose.connect('mongodb+srv://User-1:User-1@sauce.8lvmbdm.mongodb.net/test')
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.log('Unable to connect to MongoDB Atlas!');
    console.error(error);
  });

// Allows cross-origin requests to access the API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Indicates to express to serve up the static resource images whenever it receives a request to the images folder endpoint
app.use('/images', express.static(path.join(__dirname, 'images')));

// Main routes
app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);

// Export app
module.exports = app;

//express security probleme resolve
const helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "http://localhost:3000"],
    imgSrc: ["'self'", "http://localhost:3000"],
  }
}))