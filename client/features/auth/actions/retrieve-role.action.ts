'use server';

import { getUserById } from '@/shared/lib/db/mutations/user.mutations';

export async function retrieveRole(userId: string) {
  if (!userId || typeof userId != 'string') {
    console.log(`${retrieveRole.name}: ${userId}`);

    return { success: false, data: '' };
  }

  const user = await getUserById(userId);
  if (!user) {
    console.log(`${retrieveRole.name}: user not found for id ${userId}`);
    return { success: false, data: '' };
  }
  return { success: true, data: user.role };
}
