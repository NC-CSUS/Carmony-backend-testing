import { config as dotenvConfig } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import userrouter from './routes/userRoutes.js';
import postingRoutes from './routes/postingRoutes.js';
import postRoutes from './routes/postRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenvConfig();

// express app
const app = express();



// Proxy middleware for handling other requests
app.use('/api', createProxyMiddleware({
  target: 'https://carmony-backend-testing-api.onrender.com/',
  changeOrigin: true,
}));

// Middleware to parse JSON body for POST requests with a limit of 20MB
app.use(express.json({ limit: '20mb' }));

// Middleware to parse URL-encoded bodies for POST requests with a limit of 20MB
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Log path and request type
app.use((req, res, next) => {
  console.log(req.path, req.method);
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