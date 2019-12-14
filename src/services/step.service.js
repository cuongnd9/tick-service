import { prisma } from '../models/prisma-client';

function updateStatus({ id, status }) {
  return prisma.updateStep({
    data: {
      status,
    },
    where: {
      id,
    },
  });
}

export default {
  updateStatus,
};
