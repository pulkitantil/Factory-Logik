
import { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error('Only JPEG, PNG, WebP, and AVIF images are allowed'));
    }

    callback(null, true);
  },
}).single('image');

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image to upload',
      });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: 'Image upload is not configured',
      });
    }

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'voltrix/products',
          resource_type: 'image',
        },
        (error, uploadedImage) => {
          if (error) return reject(error);
          resolve(uploadedImage);
        },
      );

      stream.end(req.file!.buffer);
    });

    return res.status(201).json({
      success: true,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Image upload failed',
    });
  }
};
