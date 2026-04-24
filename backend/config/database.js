import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from 'cloudinary';
// import cloudinaryStorage from 'multer-storage-cloudinary'; // Retiré – incompatible avec Cloudinary v2

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL pool
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fonction utilitaire pour upload vers Cloudinary
export const uploadToCloudinary = (fileBuffer, folder = 'bazooka/products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: folder,
        transformation: [
          { width: 1920, height: 1080, crop: 'limit' },
          { quality: 0.8 }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Initialisation BDD (async)
export const initDB = async () => {
  try {
    const client = await pool.connect();
    
    // Table users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        avatar TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Table products
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'moto',
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER DEFAULT 0,
        brand TEXT,
        model TEXT,
        year INTEGER,
        images TEXT DEFAULT '[]',
        ebay_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Index
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

    // Vérifier si admin existe
    const adminCheck = await client.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    const adminCount = parseInt(adminCheck.rows[0].count);

    if (adminCount === 0) {
      const bcrypt = (await import('bcryptjs')).default;
      const hash1 = await bcrypt.hash('AdminBazooka123!@#', 10);
      const hash2 = await bcrypt.hash('SuperAdmin456!@#', 10);
      const hash3 = await bcrypt.hash('UserTest123!@#', 10);

      await client.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        ['admin@bazooka.com', hash1, 'admin']
      );
      await client.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        ['superadmin@bazooka.com', hash2, 'admin']
      );
      await client.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        ['user@test.com', hash3, 'user']
      );

      console.log('✅ 3 comptes par défaut créés');
    }

    client.release();
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database init error:', error.message);
    throw error;
  }
};
