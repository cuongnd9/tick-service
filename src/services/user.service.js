import { Prisma } from '@/models/prisma-client';

function getUsers() {
  return Prisma.users();
}

function getUser(id) {
  return Prisma.user({ id });
}

function createUser(data) {
  return Prisma.createUser(data);
}

function updateUser(id, data) {
  return Prisma.updateUser({
    where: { id },
    data,
  });
}

function deleteUser(id) {
  return Prisma.deleteUser({ id });
}

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
