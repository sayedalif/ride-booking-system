import { Document } from 'mongoose';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  RIDER = 'RIDER',
  DRIVER = 'DRIVER',
}

export interface IAuthProvider {
  provider: 'google' | 'credentials' | string;
  providerId: string;
}

export enum IsActive {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export interface IAddress {
  home?: string;
  work?: string;
  [key: string]: string | undefined;
}

export interface IRiderProfile {
  joinedAt: Date;
}

export interface IVehicleDetails {
  type: 'bike' | 'car' | null;
  plateNumber: string;
}

export interface IDriverProfile {
  status: IsActive;
  licenseNumber: string;
  nidNumber: string;
  vehicleDetails: IVehicleDetails;
  isOnline: boolean;
  rating: number;
  appliedAt: Date | null;
}

export interface IEmergencyContact {
  name: string;
  phoneNumber: string;
}

// Optional: Extending Document gives you access to Mongoose methods like .save(), ._id, etc.
export interface IUser extends Document {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  role: Role;
  riderProfile: IRiderProfile;
  picture?: string;
  address?: IAddress;
  driverProfile?: IDriverProfile;
  isDeleted: boolean;
  isActive: IsActive;
  isVerified: boolean;
  emergencyContacts: IEmergencyContact[];
  auths: IAuthProvider[];
}
