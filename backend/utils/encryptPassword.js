import bcryptjs from "bcryptjs";

export function hashPassword(password) {
  return bcryptjs.hashSync(password, 10);
}
export function comparePassword(password, hashPassword) {
  return bcryptjs.compareSync(password, hashPassword);
}
