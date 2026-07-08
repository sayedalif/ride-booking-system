import { model, Schema } from 'mongoose';
import { IAuthProvider, IsActive, IUser, Role } from './user.interface';

export const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { versionKey: false, _id: false },
);

// 1. Create the Driver Profile Schema separately
const driverProfileSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.INACTIVE,
    },
    licenseNumber: { type: String, required: true },
    nidNumber: { type: String, required: true },
    vehicleDetails: {
      type: { type: String, enum: ['bike', 'car'], required: true },
      plateNumber: { type: String, required: true },
    },
    isOnline: { type: Boolean, default: false },
    rating: { type: Number, default: 5.0 },
    appliedAt: { type: Date, default: Date.now },
  },
  { _id: false },
); // Prevent extra ObjectId

// 1. Create the address schema
const addressSchema = new Schema(
  {
    home: { type: String }, // Explicitly defined
    work: { type: String }, // Explicitly defined
  },
  {
    _id: false, // Prevents Mongoose from creating a separate ObjectId for the address
    strict: false, // THE MAGIC: Allows custom, dynamic keys to be saved
    timestamps: false,
    versionKey: false,
  },
);

const userSchema = new Schema<IUser>(
  {
    // --- Core Identity Layer (Always Shared) ---
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: {
      type: String,
      enum: [Role.RIDER, Role.DRIVER],
      default: Role.RIDER,
    },
    riderProfile: {
      joinedAt: { type: Date, default: Date.now },
    },
    picture: { type: String },

    // 2. Apply the address schema here
    address: { type: addressSchema },
    // 2. Attach it to the user schema and default to null
    driverProfile: {
      type: driverProfileSchema,
      default: null,
    },

    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: [IsActive.ACTIVE, IsActive.INACTIVE, IsActive.BLOCKED, IsActive.SUSPENDED, IsActive.PENDING],
      default: IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    emergencyContacts: [
      {
        name: { type: String },
        phoneNumber: { type: String },
      },
    ],
    auths: [authProviderSchema],
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

export const User = model<IUser>('User', userSchema);

/* 

Important Mongoose Tip:
When you update a dynamic property on an already existing document in memory, Mongoose sometimes struggles to detect the change. If you update a custom key, you must tell Mongoose it changed before saving:

TypeScript
const user = await User.findById(userId);
user.address.newCustomKey = 'New Value';
user.markModified('address'); // Required for dynamic keys!
await user.save();
(Note: You do not need markModified if you are using User.findByIdAndUpdate or User.updateOne, only if you are modifying the document object directly using .save())

*/
