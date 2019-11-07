import { prisma } from '../models/prisma-client';

function getUsers() {
  return prisma.users();
}

function getUser(id) {
  return prisma.user({ id });
}

function createUser(data) {
  const { account } = data;
  return prisma.createUser({
    ...data,
    account: {
      connect: {
        id: account,
      },
    },
  });
}

function updateUser(id, data) {
  const { account } = data;
  return prisma.updateUser({
    where: { id },
    data: {
      ...data,
      account: {
        connect: {
          id: account,
        },
      },
    },
  });
}

function deleteUser(id) {
  return prisma.deleteUser({ id });
}

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
