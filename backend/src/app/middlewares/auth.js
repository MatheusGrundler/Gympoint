import jwt from 'jsonwebtoken';
import { promissify } from 'util';

import authconfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }
  return res.json();
};
