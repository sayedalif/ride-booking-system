import { Router } from 'express';
import { UserController } from './user.controller';
import { applyDriverValidationSchema, createUserZodSchema, updateAdminStatusZodSchema,  } from './user.validation';
// updateUserZodSchema
import { validateRequest } from '../../middlewares/validateRequest';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from './user.interface';

const router = Router();
// user registration route
router.post(
  '/register',
  validateRequest(createUserZodSchema),
  UserController.createUser,
);
// user retrieval route - admin only
router.get(
  '/all-users',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.getAllUsers,
);
// Apply as Driver Route: Requires login first, then validates driver payload
router.post(
  '/apply-driver',
  checkAuth(...Object.values(Role)),
  validateRequest(applyDriverValidationSchema),
  UserController.applyForDriver,
);

// user update route
// !pending highly vulnerable
// !todo: this route need to be checked
// router.patch(
//   '/:id',
//   validateRequest(updateUserZodSchema),
//   checkAuth(...Object.values(Role)),
//   UserController.updateUser,
// );

/* router.patch(
  '/users/block/:id',
  // validateRequest(updateUserZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.updateUserApproval
); */

// PATCH: Update Administrative Status (isDeleted, isActive, isVerified)
router.patch(
  '/:id/admin-status',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN), // Block Drivers and Riders
  validateRequest(updateAdminStatusZodSchema),
  UserController.updateUserStatus
);

export const UserRoutes = router;
