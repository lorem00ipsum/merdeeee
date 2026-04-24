import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requis' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

export const authorizeAdmin = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (rows.length === 0 || rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé - Admin requis' });
    }
    
    req.user.role = rows[0].role;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Erreur authentification' });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      const { rows } = await pool.query(
        'SELECT id, email, role, avatar FROM users WHERE id = $1',
        [decoded.id]
      );
      if (rows.length > 0) {
        req.user = rows[0];
      }
    } catch (err) {
      // Token invalide, on continue sans user
    }
  }
  next();
};
