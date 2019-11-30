import { prisma } from '../models/prisma-client';

function createTask(data) {
  const { account, steps, images, category, ...otherData } = data;
  return prisma.createTask({
    ...otherData,
    category: {
      connect: {
        id: category,
      },
    },
    account: {
      connect: {
        id: account,
      },
    },
    steps: {
      create: [
        ...steps.map((step, index) => ({
          index,
          title: step.title,
          account: {
            connect: {
              id: account,
            },
          },
        })),
      ],
    },
    images: {
      create: [
        ...images.map(image => ({
          image: {
            connect: {
              id: image,
            },
          },
          account: {
            connect: {
              id: account,
            },
          },
        })),
      ],
    },
  });
}

export default {
  createTask,
};
