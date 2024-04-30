import { posting } from '../controllers/postingController.js';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import AWS from 'aws-sdk'; // Import the AWS SDK
import express from 'express';
import multer from 'multer';
import sharp from 'sharp'; // Import sharp for image resizing

// Set up multer memory storage with a 10MB limit
const storage = multer.memoryStorage({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
const upload = multer({ storage });

// Configure AWS SDK with your credentials and desired region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-west-1' // Set your desired AWS region
});

// Create an S3 client
const s3 = new S3Client();

// Create an Express router
const router = express.Router();

// Route for posting form data (without image)
router.post('/Posting', posting);

// Route for uploading images
router.post('/UploadImage', upload.single('image'), async (req, res) => {
  try {
    // Resize the image using sharp
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 800 }) // Resize to a width of 800 pixels (adjust as needed)
      .toBuffer();

    // Get the formID from the request body
    const key = req.body.formID;

    // Create a PutObjectCommand with the resized image buffer
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET,
      Key: key,
      Body: resizedImageBuffer, // Use the resized image buffer
      ContentType: req.file.mimetype,
    });

    // Send the command to S3
    await s3.send(command);

    console.log("Image upload success");
    return res.status(200).send('Image upload successful');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Export the router
export default router;
