import { User } from "@/frontend/src/types";

export function toPublicUser(user: User): Omit<User, 'twoFactorSecret'> {
  const { twoFactorSecret, ...publicUser } = user;
  return publicUser;
}