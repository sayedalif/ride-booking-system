import { Router } from 'express';
// import { UserController } from './user.controller';
// import { createUserZodSchema, updateUserZodSchema } from './user.validation';
// import { validateRequest } from '../../middlewares/validateRequest';
// import { createDriverZodSchema } from './driver.validation';
import { DriverController } from './driver.controller';
import { Role } from '../user/user.interface';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { updateOnlineStatusZodSchema } from '../user/user.validation';
// import { checkAuth } from '../../middlewares/checkAuth';
// import { Role } from './user.interface';

const router = Router();

router.get(
  '/all-drivers',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DriverController.getAllDrivers,
);

// for admin and super admin to approve driver
router.patch(
  '/approve/:id',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DriverController.updateDriverApproval,
);

router.patch(
  '/toggle-availability',
  checkAuth(Role.DRIVER), // Strictly locked to the DRIVER role context
  validateRequest(updateOnlineStatusZodSchema), // Ensures the request body has a valid boolean isOnline field
  DriverController.updateOnlineStatus,
);

// GET: Retrieve earning statistics for the logged-in driver
router.get(
  '/me/earnings',
  checkAuth(Role.DRIVER), // Strictly limits access to Drivers
  DriverController.getMyEarnings,
);

export const DriverRoutes = router;
