import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../core/ApiError.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  let customError = err;

  if (!(err instanceof ApiError)) {
    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Lỗi máy chủ nội bộ';
    customError = new ApiError(statusCode, message);
  }

  if (err.name === 'CastError') {
    customError = new ApiError(StatusCodes.BAD_REQUEST, `Dữ liệu không hợp lệ: ${err.path}`);
  }

  if (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000)) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    customError = new ApiError(
      StatusCodes.CONFLICT,
      `Giá trị của trường '${field}' đã tồn tại. Vui lòng chọn giá trị khác.`,
    );
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    customError = new ApiError(StatusCodes.BAD_REQUEST, messages.join('. '));
  }

  res.status(customError.statusCode).json({
    success: false,
    message: customError.message,
  });
};
