import bcrypt from 'bcryptjs';
import { findUserByEmail } from '../user/find-user-by-email';
import { updateUser } from '../user/update-user';
import { insertUser } from '../user/insert-user';

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const user = await findUserByEmail(email);

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomUUID();
  const tokenExpiry = new Date(Date.now() + 3600000); // Expires in 1 hour from now

  const inactiveAccount = {
    name,
    password: hashedPassword,
    verificationToken,
    tokenExpiry,
    // With emailVerified empty, the account remains inactive
  };

  if (user) {
    if (user.emailVerified != null) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    await updateUser(user.id, inactiveAccount);
  } else {
    await insertUser(inactiveAccount);
  }
  return { verificationToken };
}
