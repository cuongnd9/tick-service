import { prisma } from '../models/prisma-client';

function getCategoryList(data) {
  const { account, keyword } = data;
  const fragment = `
  fragment CategoryFullProps on Category {
    id
    index
    name
    tasks {
      id
      status
    }
  }
  `;
  return prisma
    .categories({
      where: {
        name_contains: keyword,
        account: {
          id: account,
        },
      },
    })
    .$fragment(fragment);
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

function updateCategory(data) {
  const { id, ...otherData } = data;
  return prisma.updateCategory({ data: { ...otherData }, where: { id } });
}

function deleteCategory(id) {
  return prisma.deleteCategory({ id });
}

export default {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
};
