import { Router } from 'express';
import * as userController from './user.controller.js';
import { RegisterSchema, LoginSchema, fullNameSchema } from './user.schema.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { registerApiDoc } from '../../utils/swagger.utils.js';
import { config } from '../../config/index.js';

const router = Router();

registerApiDoc(
  'post',
  `${config.api.prefix}/users/register`,
  'Đăng ký tài khoản',
  'Users',
  RegisterSchema,
);
registerApiDoc(
  'post',
  `${config.api.prefix}/users/login`,
  'Đăng nhập vào hệ thống',
  'Users',
  LoginSchema,
);
registerApiDoc('post', `${config.api.prefix}/users/refresh-token`, 'Cấp lại Access Token', 'Users');
registerApiDoc(
  'get',
  `${config.api.prefix}/users`,
  'Lấy danh sách người dùng (Chỉ Admin)',
  'Users',
);
registerApiDoc(
  'get',
  `${config.api.prefix}/users`,
  'Lấy danh sách người dùng',
  'Users',
  null,
  true,
);
registerApiDoc(
  'patch',
  `${config.api.prefix}/users/{id}`,
  'Cập nhật họ tên',
  'Users',
  fullNameSchema,
  true,
);

router.post('/register', validate(RegisterSchema), userController.register);
router.post('/login', validate(LoginSchema), userController.login);
router.post('/refresh-token', userController.refreshTokenHandler);

router.use(protect);

router.route('/').get(authorize('admin'), userController.getAllUsers);

router.route('/:id').patch(userController.updateFullName);

export default router;
