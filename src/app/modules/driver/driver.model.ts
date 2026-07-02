import { model, Schema } from 'mongoose';
import { IDriver, IVehicleDetails, VehicleType } from './driver.interface';
import { IsActive, Role } from '../user/user.interface';
import { authProviderSchema } from '../user/user.model';

// Define vehicle details sub-schema
const vehicleDetailsSchema = new Schema<IVehicleDetails>(
  {
    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      required: [true, 'Vehicle type is required'],
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      trim: true,
    },
  },
  { _id: false } // Prevents creating _id for subdocuments
);

const driverSchema = new Schema<IDriver>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.DRIVER,
    },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    approvalStatus: { type: Boolean, default: false },
    onlineStatus: { type: Boolean, default: true },
    vehicleDetails: {
      type: [vehicleDetailsSchema],
      default: [],
      validate: {
        validator: function (v: IVehicleDetails[]) {
          return v && v.length > 0;
        },
        message: 'Driver must have at least one vehicle',
      },
    },
    auths: [authProviderSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Driver = model<IDriver>('Driver', driverSchema);
