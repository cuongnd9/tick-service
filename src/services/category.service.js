import { prisma } from '../models/prisma-client';

function getCategoryList(data) {
  const { account } = data;
  return prisma.categories({
    where: {
      account: {
        id: account,
      },
    },
  });
}

async function createCategory(data) {
  const { account, ...otherData } = data;
  let maxIndex = 0;
  const categoryLists = await prisma.categories({
    where: {
      account: {
        id: account,
      },
    },
    orderBy: 'index_DESC',
  });
  if (categoryLists.length > 0) {
    maxIndex = categoryLists[0].index + 1;
  }
  return prisma.createCategory({
    ...otherData,
    index: maxIndex,
    account: {
      connect: {
        id: account,
      },
    },
  });
}

export default {
  getCategoryList,
  createCategory,
};
