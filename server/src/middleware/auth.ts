import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

if (!JWT_SECRET || !ADMIN_JWT_SECRET) {
  throw new Error(
    'JWT_SECRET and ADMIN_JWT_SECRET must be configured in the server environment.'
  );
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
      req.user = decoded;
    } catch {
      // ignore invalid optional token
    }
  }
  next();
};


export const authenticateAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required.',
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET!, {
  algorithms: ['HS256'],
  maxAge: '2h',
});

    if (
      typeof decoded === 'string' ||
      decoded.tokenType !== 'admin' ||
      typeof decoded.id !== 'string' ||
      typeof decoded.email !== 'string' ||
      typeof decoded.role !== 'string'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin token.',
      });
    }

    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Admin session is invalid or expired.',
    });
  }
};
