export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  RIDER = 'RIDER',
  DRIVER = 'DRIVER',
}

export interface IAuthProvider {
  provider: 'google' | 'credentials'; // e.g., 'google', 'credentials'
  providerId: string;
}

export enum IsActive {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED', // for users or riders
  SUSPENDED = 'SUSPENDED', // for drivers
}

// Add this to user.interface.ts
export interface IAddress {
  home?: string; // You can make these required if you want
  work?: string;
  [key: string]: string | undefined; // Allows any custom dynamic property names
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  picture?: string;
  address?: IAddress;
  isDeleted?: string;
  isActive?: IsActive;
  isVerified?: boolean;
  role: Role;
  auths: IAuthProvider[];
}
