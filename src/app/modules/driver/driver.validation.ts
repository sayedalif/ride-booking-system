import z from 'zod';
import { IsActive, Role } from '../user/user.interface';
import { VehicleType } from './driver.interface';

// Vehicle Details Zod Schema
const vehicleDetailsZodSchema = z.object({
  vehicleType: z.enum([VehicleType.BIKE, VehicleType.CAR, VehicleType.VAN], {
    message: 'Vehicle type must be BIKE, CAR, or VAN',
  }),
  model: z
    .string({ message: 'Vehicle model is required' })
    .min(1, { message: 'Vehicle model cannot be empty' })
    .max(100, { message: 'Vehicle model cannot exceed 100 characters' })
    .trim(),
  plateNumber: z
    .string({ message: 'Plate number is required' })
    .min(1, { message: 'Plate number cannot be empty' })
    .max(50, { message: 'Plate number cannot exceed 50 characters' })
    .trim(),
});

export const createDriverZodSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(50, { message: 'Name cannot exceed 50 characters.' })
    .trim(),
  email: z
    .string({ message: 'Email is required' })
    .email({ message: 'Invalid email address format.' })
    .min(5, { message: 'Email must be at least 5 characters long.' })
    .max(100, { message: 'Email cannot exceed 100 characters.' })
    .trim()
    .toLowerCase(),
  password: z
    .string({ message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .regex(/^(?=.*[A-Z])/, {
      message: 'Password must contain at least 1 uppercase letter.',
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: 'Password must contain at least 1 special character.',
    })
    .regex(/^(?=.*\d)/, {
      message: 'Password must contain at least 1 number.',
    }),
  role: z
    .nativeEnum(Role, {
      message: 'Invalid role',
    })
    .default(Role.DRIVER)
    .optional(),
  phone: z
    .string()
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        'Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX',
    })
    .optional(),
  picture: z
    .string()
    .url({ message: 'Picture must be a valid URL' })
    .optional(),
  address: z
    .string()
    .max(200, { message: 'Address cannot exceed 200 characters.' })
    .trim()
    .optional(),
  isDeleted: z.boolean().default(false).optional(),
  isActive: z
    .nativeEnum(IsActive, {
      message: 'Invalid active status',
    })
    .default(IsActive.ACTIVE)
    .optional(),
  isVerified: z.boolean().default(false).optional(),
  approvalStatus: z.boolean().default(false).optional(),
  onlineStatus: z.boolean().default(true).optional(),
  vehicleDetails: z
    .array(vehicleDetailsZodSchema)
    .min(1, { message: 'Driver must have at least one vehicle' }),
});
