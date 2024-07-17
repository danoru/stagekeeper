import prisma from "./db";

export function getUsers() {
  const users = prisma.users.findMany({
    orderBy: { username: "asc" },
  });
  return users;
}
