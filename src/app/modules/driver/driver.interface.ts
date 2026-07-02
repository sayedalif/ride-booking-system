import { IAuthProvider, IsActive, Role } from '../user/user.interface';

export enum VehicleType {
  BIKE = 'BIKE',
  CAR = 'CAR',
  VAN = 'VAN',
};

export interface IVehicleDetails {
  vehicleType: VehicleType;
  model: string;
  plateNumber: string;
}

export interface IDriver {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  isDeleted?: string;
  isActive?: IsActive;
  isVerified?: boolean;
  role: Role;
  approvalStatus: boolean;
  onlineStatus: boolean;
  vehicleDetails: IVehicleDetails[];
  auths: IAuthProvider[];
}
