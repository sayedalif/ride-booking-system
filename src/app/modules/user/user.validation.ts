import { z } from 'zod';
import { IsActive } from './user.interface';


// --- 1. User Signup Validation ---
// The client should only send basic credentials. The backend handles the rest.
export const createUserZodSchema = z.object({
  fullName: z
    .string({ error: 'Full name is required' })
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name cannot exceed 50 characters'),

  // Validates standard 11-digit Bangladeshi numbers (with optional +88/88 prefix)
  phoneNumber: z
    .string({ error: 'Phone number is required' })
    .regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, 'Invalid phone number format'),

  email: z.string().email('Invalid email format').optional(), // Because sparse is true in Mongoose

  password: z
    .string({ error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(32, 'Password cannot exceed 32 characters'),
});

// --- 2. Driver Application Validation ---
// The client sends documents and vehicle data. Status and appliedAt are set by the controller.
export const applyDriverValidationSchema = z.object({
  licenseNumber: z
    .string({ error: 'License number is required' })
    .min(5, 'License number is too short'),

  nidNumber: z
    .string({ error: 'NID number is required' })
    .min(10, 'NID must be at least 10 characters'),

  vehicleDetails: z.object(
    {
      type: z.enum(['bike', 'car'], {
        error: 'Vehicle type is required',
        invalid_type_error: "Vehicle type must be either 'bike' or 'car'",
      }),
      plateNumber: z
        .string({ error: 'Plate number is required' })
        .min(4, 'Plate number is too short'),
    },
    { error: 'Vehicle details are required' },
  ),
});

export const updateOnlineStatusZodSchema = z.object({
  isOnline: z.boolean({
    // required_error: 'isOnline status is required',
    error: 'isOnline must be a boolean value (true or false)',
  }),
});



export const updateAdminStatusZodSchema = z
  .object({
    isDeleted: z
      .boolean({
        error: 'isDeleted must be a boolean',
      })
      .optional(),

    isActive: z
      .enum(
        [
          IsActive.ACTIVE,
          IsActive.INACTIVE,
          IsActive.BLOCKED,
          IsActive.SUSPENDED,
        ],
        {
          invalid_type_error: 'Invalid active status provided',
        },
      )
      .optional(),

    isVerified: z
      .boolean({
        error: 'isVerified must be a boolean',
      })
      .optional(),
  })
  .refine(
    data =>
      data.isDeleted !== undefined ||
      data.isActive !== undefined ||
      data.isVerified !== undefined,
    {
      message:
        'At least one status field (isDeleted, isActive, or isVerified) must be provided in the request.',
    },
  );
