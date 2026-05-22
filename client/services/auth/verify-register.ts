import { findUserByEmail } from '../user/find-user-by-email';
import { updateUser } from '../user/update-user';

export async function verifyRegister(email: string, verificationCode: string) {
  const user = await findUserByEmail(email);
  if (!user || user.emailVerified != null) {
    throw new Error('INVALID_OR_EXPIRED_CODE');
  }

  const isMatched = user.verificationToken === verificationCode;
  const isExpired = user.tokenExpiry ? new Date() > user.tokenExpiry : true;
  if (!isMatched || isExpired) {
    throw new Error('INVALID_OR_EXPIRED_CODE');
  }

  await updateUser(user.id, {
    emailVerified: new Date(),
    verificationToken: null,
    tokenExpiry: null,
  });
}
