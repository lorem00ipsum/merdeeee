import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { pool } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage (fichiers en RAM avant upload Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Upload multiple images (produit)
router.post('/images', authenticate, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          {
            folder: 'bazooka/products',
            resource_type: 'image',
            transformation: [
              { width: 1920, height: 1080, crop: 'limit' },
              { quality: 0.8 }
            ]
          },
          (error, result) => {
            if (error) return reject(error);
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
            });
          }
        );
        stream.end(file.buffer);
      });
    });

    const images = await Promise.all(uploadPromises);
    res.json({ count: images.length, images });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload des images' });
  }
});

// Upload single image (admin)
router.post('/image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          folder: 'bazooka/products',
          resource_type: 'image',
          transformation: [
            { width: 1920, height: 1080, crop: 'limit' },
            { quality: 0.8 }
          ]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Erreur upload' });
  }
});

// Upload avatar (user)
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier' });
    }

    // Upload vers Cloudinary (avatars)
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          folder: 'bazooka/avatars',
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'thumb', gravity: 'face' },
            { quality: 0.9 }
          ]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Supprimer l'ancien avatar si existe (optionnel)
    // TODO: delete old avatar from DB & Cloudinary

    // Save avatar URL to user
    await pool.query(
      'UPDATE users SET avatar = $1 WHERE id = $2',
      [result.secure_url, req.user.id]
    );

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Erreur upload avatar' });
  }
});

// DELETE IMAGE (admin)
router.delete('/image/:publicId', authenticate, async (req, res) => {
  try {
    await cloudinary.v2.uploader.destroy(req.params.publicId);
    res.json({ message: 'Image supprimée' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

export default router;
