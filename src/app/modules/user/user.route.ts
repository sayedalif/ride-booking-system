import { Router } from 'express';
import { UserController } from './user.controller';
import { createUserZodSchema, updateUserZodSchema } from './user.validation';
import { validateRequest } from '../../middlewares/validateRequest';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from './user.interface';

const router = Router();
// user registration route
router.post(
  '/register',
  validateRequest(createUserZodSchema),
  UserController.createUser
);
// user retrieval route - admin only
router.get(
  '/all-users',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.getAllUsers
);

// user update route
router.patch(
  '/:id',
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserController.updateUser
);

/* router.patch(
  '/users/block/:id',
  // validateRequest(updateUserZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.updateUserApproval
); */

export const UserRoutes = router;
