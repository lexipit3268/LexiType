import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { StatusCodes } from 'http-status-codes';

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Lỗi validate dữ liệu',
        errors: result.error,
      });
    }
    next();
  };
