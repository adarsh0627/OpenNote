import { users } from "../mock/users";

export const getCurrentUser = async () => {
  return users[0];
};
