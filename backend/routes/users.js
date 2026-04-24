import express from 'express';
import { pool } from '../config/database.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET ALL USERS (admin only)
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, email, role, avatar, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    // Format dates
    const users = rows.map(u => ({
      ...u,
      created_at: u.created_at.toISOString(),
    }));

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET ONE USER (admin or self)
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Admin can see anyone, user can see only self
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { rows } = await pool.query(
      'SELECT id, email, role, avatar, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// UPDATE USER (avatar only for now)
router.put('/me', authenticate, async (req, res) => {
  try {
    const { avatar } = req.body;

    const { rows } = await pool.query(
      'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, email, role, avatar, created_at',
      [avatar || '', req.user.id]
    );

    res.json({ user: rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
