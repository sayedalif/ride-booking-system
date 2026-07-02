import { model, Schema } from 'mongoose';
import { IAuthProvider, IsActive, IUser } from './user.interface';

export const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { versionKey: false, _id: false },
);

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
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // role: {
    //   type: String,
    //   enum: Object.values(Role),
    // },
    phone: { type: String, required: true },
    picture: { type: String },

    // 2. Apply the address schema here
    address: { type: addressSchema },

    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
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
