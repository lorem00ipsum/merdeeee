import express from 'express';
import { pool } from '../config/database.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import cloudinary from 'cloudinary';

const router = express.Router();

// GET ALL PRODUCTS (public)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM products 
      ORDER BY created_at DESC
    `);

    const products = rows.map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      price: parseFloat(p.price),
      stock: parseInt(p.stock),
      year: parseInt(p.year),
    }));

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET ONE PRODUCT (public)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    const product = {
      ...rows[0],
      images: JSON.parse(rows[0].images || '[]'),
      price: parseFloat(rows[0].price),
      stock: parseInt(rows[0].stock),
      year: parseInt(rows[0].year),
    };

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// CREATE PRODUCT (admin only)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, description, category, price, stock, brand, model, year, ebay_url, images } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Nom et prix requis' });
    }

    const { rows } = await pool.query(`
      INSERT INTO products (name, description, category, price, stock, brand, model, year, ebay_url, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      name,
      description || '',
      category || 'moto',
      price,
      stock || 0,
      brand || '',
      model || '',
      year || 2024,
      ebay_url || '',
      JSON.stringify(images || []),
    ]);

    const product = {
      ...rows[0],
      images: images || [],
      price: parseFloat(rows[0].price),
      stock: parseInt(rows[0].stock),
    };

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// UPDATE PRODUCT (admin only)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, stock, brand, model, year, ebay_url, images } = req.body;

    // Vérifier existence
    const { rows: existing } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    const current = existing[0];

    const { rows } = await pool.query(`
      UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        price = COALESCE($4, price),
        stock = COALESCE($5, stock),
        brand = COALESCE($6, brand),
        model = COALESCE($7, model),
        year = COALESCE($8, year),
        ebay_url = COALESCE($9, ebay_url),
        images = COALESCE($10, images)
      WHERE id = $11
      RETURNING *
    `, [
      name,
      description,
      category,
      price,
      stock,
      brand,
      model,
      year,
      ebay_url,
      images ? JSON.stringify(images) : null,
      id,
    ]);

    const product = {
      ...rows[0],
      images: JSON.parse(rows[0].images || '[]'),
      price: parseFloat(rows[0].price),
      stock: parseInt(rows[0].stock),
    };

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE PRODUCT (admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING images',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Supprimer images Cloudinary
    const images = JSON.parse(rows[0].images || '[]');
    const deletePromises = images.map(imgUrl => {
      // Extract public_id from URL like: https://res.cloudinary.com/cloud/image/upload/v123/folder/public_id.jpg
      const parts = imgUrl.split('/');
      const filenameWithExt = parts[parts.length - 1];
      const public_id = filenameWithExt.split('.')[0]; // Remove extension
      return cloudinary.v2.uploader.destroy(public_id);
    });

    await Promise.all(deletePromises);

    res.json({ message: 'Produit et images supprimés' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
