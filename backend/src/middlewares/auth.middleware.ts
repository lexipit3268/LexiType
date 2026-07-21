import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { ApiError } from '../core/ApiError.js';
import { StatusCodes } from 'http-status-codes';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

// Authentication Access Token
export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new ApiError(StatusCodes.UNAUTHORIZED, 'Bạn chưa đăng nhập. Vui lòng cung cấp token!'),
    );
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret as string) as { id: string; role: string };

    // Nhét thông tin user (id, role) vào request để các Controller phía sau có thể lấy dùng
    req.user = decoded;
    next();
  } catch (error) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token không hợp lệ hoặc đã hết hạn!'));
  }
};

// Authorization
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền thực hiện hành động này!'),
      );
    }
    next();
  };
};
