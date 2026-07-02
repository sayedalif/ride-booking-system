import { envVars } from '../config/env';
import { IAuthProvider, IUser, Role } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';
import bcryptjs from 'bcryptjs';

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: process.env.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExist) {
      console.log('Super Admin already exists');
      return;
    }

    console.log('Seeding Super Admin...');

    const hashedPassword = await bcryptjs.hash(
      envVars.SUPER_ADMIN_PASSWORD,
      parseInt(envVars.BCRYPT_SALT_ROUNDS)
    );

    const authProvider: IAuthProvider = {
      provider: 'credentials',
      providerId: envVars.SUPER_ADMIN_EMAIL,
    };

    const payload: IUser = {
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
      email: envVars.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      isVerified: true,
      auths: [authProvider],
    };
    const superAdmin = await User.create(payload);
    console.log('Super Admin seeded successfully:', superAdmin);
  } catch (error) {
    console.log(error);
  }
};
