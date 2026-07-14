import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as userService from './user.service.js';
import { asyncHandler } from '../../core/asyncHandler.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const userData = req.body;
  const newUser = await userService.createUser(userData);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Đăng ký tài khoản thành công!',
    data: newUser,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await userService.loginUser(email, password);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.status(StatusCodes.OK).cookie('refreshToken', refreshToken, cookieOptions).json({
    success: true,
    message: 'Đăng nhập thành công!',
    accessToken: accessToken,
    data: user,
  });
});

export const refreshTokenHandler = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Không tìm thấy Refresh Token. Vui lòng đăng nhập lại!',
    });
    return;
  }

  const newAccessToken = await userService.refreshAuthToken(incomingRefreshToken);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Làm mới Token thành công!',
    accessToken: newAccessToken,
  });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();

  res.status(StatusCodes.OK).json({
    success: true,
    data: users,
  });
});

export const updateFullName = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fullName } = req.body;

  const updatedUser = await userService.updateFullName(String(id), fullName);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cập nhật họ tên thành công!',
    data: updatedUser,
  });
});
