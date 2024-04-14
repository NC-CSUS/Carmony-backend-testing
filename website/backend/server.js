import { config as dotenvConfig } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import userrouter from './routes/userRoutes.js';
import postingRoutes from './routes/postingRoutes.js';
import postRoutes from './routes/postRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

dotenvConfig();

// express app
const app = express();

app.options('*', cors());

// Middleware to handle HEAD requests
app.use((req, res, next) => {
  if (req.method === 'HEAD') {
    console.log(req.path, req.method, req.body);
    // Respond to HEAD requests
    res.sendStatus(200);
  } else {
    console.log(req.path, req.method, req.body);
    // Call the next middleware in the chain
    next();
  }
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});



// Middleware to parse JSON body for POST requests with a limit of 20MB
app.use(express.json({ limit: '20mb' }));

// Middleware to parse URL-encoded bodies for POST requests with a limit of 20MB
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Log path and request type
app.use((req, res, next) => {
  console.log(req.path, req.method, req.body);
  next();
});

// Routes
app.use('/api/userRoutes', userrouter);
app.use('/api/postingRoutes', postingRoutes);
app.use('/api/postRoutes', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/vehicleRoutes', vehicleRoutes);

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log('CONNECTED. Listening on port 4k');
    });
  })
  .catch((error) => {
    console.log(error);
  });