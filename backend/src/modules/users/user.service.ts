import User, { IUser } from './user.model.js';
import bcrypt from 'bcryptjs';
import { ApiError } from '../../core/ApiError.js';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';

export const getUserInformation = async (email: string) => {
  return await User.findOne({ email });
};

export const createUser = async (payload: Partial<IUser>) => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email này đã được sử dụng!');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(payload.password as string, salt);

  const newUser = new User({
    email: payload.email,
    fullName: payload.fullName,
    password: hashedPassword,
  });

  return await newUser.save();
};

export const updateFullName = async (id: string, fullName: string) => {
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { fullName },
    { new: true, runValidators: true },
  );

  if (!updatedUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng này!');
  }

  return updatedUser;
};

export const getAllUsers = async () => {
  return await User.find().sort({ createdAt: -1 });
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không chính xác!');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không chính xác!');
  }

  const accessToken = jwt.sign({ id: user.id, role: user.role }, config.jwt.secret as string, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret as string, {
    expiresIn: '7d',
  });

  return { user, accessToken, refreshToken };
};

export const refreshAuthToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret as string) as { id: string };

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Người dùng không tồn tại!');
    }

    const newAccessToken = jwt.sign({ id: user.id, role: user.role }, config.jwt.secret as string, {
      expiresIn: '15m',
    });

    return newAccessToken;
  } catch (error) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!',
    );
  }
};
