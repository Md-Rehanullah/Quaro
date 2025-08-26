require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const questionsRouter = require('./routes/questions');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 1000;

// Middlewares
app.use(cors({
  origin: [
    'https://md-rehanullah.github.io',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://127.0.0.1:3000'
  ]
}));
app.use(express.json());

// Routes
app.use('/api/questions', questionsRouter);
app.use('/api/report', reportsRouter);

// Root
app.get('/', (req, res) => {
  res.send('Quaro backend is running!');
});

// DB connection and server start
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
});


const path = require('path');
// Serve static files from the root directory (adjust if needed)
app.use(express.static(path.join(__dirname, '..')));
