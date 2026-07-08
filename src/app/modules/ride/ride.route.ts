import { Router } from 'express';
import { rideController } from './ride.controller';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
import { validateRequest } from '../../middlewares/validateRequest';
import { createRideZodSchema, getFareQuoteZodSchema, updateRideStatusZodSchema } from './ride.validation';

const router = Router();

router.post(
  '/new-ride',
  checkAuth(Role.RIDER),
  validateRequest(createRideZodSchema),
  rideController.createRide,
);

// admin and super admin only
router.get(
  '/all-riders',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  rideController.getAllRiders,
);

router.get(
  '/my-history',
  checkAuth(Role.RIDER),
  rideController.getRiderHistory,
);

// Get a fare quote
router.post(
  '/quote',
  checkAuth(Role.RIDER),
  validateRequest(getFareQuoteZodSchema),
  rideController.getFareQuote,
);

router.patch(
  '/cancel/:rideId',
  checkAuth(Role.RIDER),
  rideController.cancelRide,
);

router.patch(
  '/:id/status',
  checkAuth(Role.DRIVER, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateRideStatusZodSchema),
  rideController.updateRideStatus,
);

export const RideRoutes = router;
