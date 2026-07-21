import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const RegisterSchema = z
  .object({
    email: z
      .string({ message: 'Email là bắt buộc và phải là chuỗi' })
      .email('Định dạng email không hợp lệ')
      .openapi({
        description: 'Email định danh của người dùng',
        example: 'user@example.com',
      }),

    password: z
      .string({ message: 'Mật khẩu là bắt buộc' })
      .min(6, 'Mật khẩu phải chứa ít nhất 6 ký tự')
      .openapi({
        description: 'Mật khẩu đăng nhập (sẽ được hash)',
        example: '123456',
      }),

    fullName: z
      .string({ message: 'Họ và tên là bắt buộc' })
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .openapi({
        description: 'Họ và tên hiển thị',
        example: 'Nguyen Van A',
      }),
  })
  .strict()
  .openapi('RegisterRequest');

export const LoginSchema = z
  .object({
    email: z
      .string({ message: 'Email là bắt buộc' })
      .email('Định dạng email không hợp lệ')
      .openapi({ example: 'user@example.com' }),

    password: z.string({ message: 'Mật khẩu là bắt buộc' }).openapi({ example: '123456' }),
  })
  .openapi('LoginRequest');

export const fullNameSchema = z
  .object({
    fullName: z.string({ message: 'Họ tên phải đầy đủ' }).openapi({ example: 'Nguyễn Văn Thị' }),
  })
  .openapi('fullNameSchema');
