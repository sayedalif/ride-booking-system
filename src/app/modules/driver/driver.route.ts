import { Router } from 'express';
// import { UserController } from './user.controller';
// import { createUserZodSchema, updateUserZodSchema } from './user.validation';
import { validateRequest } from '../../middlewares/validateRequest';
import { createDriverZodSchema } from './driver.validation';
import { DriverController } from './driver.controller';
import { Role } from '../user/user.interface';
import { checkAuth } from '../../middlewares/checkAuth';
// import { checkAuth } from '../../middlewares/checkAuth';
// import { Role } from './user.interface';

const router = Router();

router.post(
  '/register',
  validateRequest(createDriverZodSchema),
  DriverController.createDriver
);
router.get(
  '/all-drivers',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DriverController.getAllDrivers
);
router.patch(
  '/:id',
  // validateRequest(updateDriverZodSchema),
  checkAuth(...Object.values(Role)),
  DriverController.updateDriver
);

// ! todo: approve driver but i
//  need to make sure it is only used for drivers approval
// not for users or riders
// also i need to make sure drivers has all the required documents and info
router.patch(
  '/drivers/approve/:id',
  // validateRequest(updateDriverZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN)
);

export const DriverRoutes = router;
