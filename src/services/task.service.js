import moment from 'moment';
import { prisma } from '../models/prisma-client';
import { taskListType } from '../config/constants';

async function getTaskList(data) {
  const { accountId, keyword, categoryIdList, statusList, priorityList, isImportantList } = data;
  const fragment = `
  fragment TaskFullProps on Task {
    id
    index
    title
    description
    status
    priority
    isImportant
    dueDate
    reminderDate
    doSendMail
    category {
      id
      index
      name
      createdAt
      updatedAt
    }
    steps {
      id
      index
      title
      status
      createdAt
      updatedAt
    }
    images {
      id
      image {
        id
        publicId
        url
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
  `;
  const taskList = await prisma
    .tasks({
      where: {
        title_contains: keyword,
        category: {
          id_in: categoryIdList,
        },
        status_in: statusList,
        priority_in: priorityList,
        isImportant: isImportantList && isImportantList.length === 1 && isImportantList[0],
        account: {
          id: accountId,
        },
      },
      orderBy: 'dueDate_ASC',
    })
    .$fragment(fragment);
  const olderList = [];
  const todayList = [];
  const tomorrowList = [];
  const nextDaysList = [];
  taskList.forEach(task => {
    if (
      moment(task.updatedAt, 'YYYY-MM-DD').isBefore(
        moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD'),
      )
    ) {
      olderList.push(task);
      return;
    }
    if (moment(task.updatedAt, 'YYYY-MM-DD').isSame(moment().format('YYYY-MM-DD'))) {
      todayList.push(task);
      return;
    }
    if (
      moment(task.updatedAt, 'YYYY-MM-DD').isSame(
        moment()
          .add(1, 'days')
          .format('YYYY-MM-DD'),
      )
    ) {
      tomorrowList.push(task);
      return;
    }
    nextDaysList.push(task);
  });
  return [
    {
      type: taskListType.olderDays,
      data: olderList,
    },
    {
      type: taskListType.today,
      data: todayList,
    },
    {
      type: taskListType.tomorrow,
      data: tomorrowList,
    },
    {
      type: taskListType.nextDays,
      data: nextDaysList,
    },
  ];
}

async function createTask(data) {
  const { account, steps = [], images = [], category, ...otherData } = data;
  let currentIndex = 0;
  const taskList = await prisma.tasks({
    where: {
      account: {
        id: account,
      },
    },
    orderBy: 'index_DESC',
  });
  if (taskList.length > 0) {
    currentIndex = taskList[0].index + 1;
  }
  return prisma.createTask({
    ...otherData,
    index: currentIndex,
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

async function updateTask(data) {
  const { id, account, steps = {}, images = {}, category, ...otherData } = data;
  const { newSteps = [], deleteSteps = [] } = steps;
  const { newImages = [], deleteImages = [] } = images;
  await prisma.deleteManySteps({
    id_in: deleteSteps,
  });
  await prisma.deleteManyTaskImages({
    id_in: deleteImages,
  });
  const fragment = `
  fragment TaskFullProps on Task {
    id
    index
    title
    description
    status
    priority
    isImportant
    dueDate
    reminderDate
    doSendMail
    category {
      id
      index
      name
      createdAt
      updatedAt
    }
    steps {
      id
      index
      title
      status
      createdAt
      updatedAt
    }
    images {
      id
      image {
        id
        publicId
        url
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
  `;
  return prisma
    .updateTask({
      data: {
        ...otherData,
        category: category ? {
          connect: {
            id: category,
          },
        } : {},
        steps: {
          create: [
            ...newSteps.map((step, index) => ({
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
            ...newImages.map(image => ({
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
      },
      where: {
        id,
      },
    })
    .$fragment(fragment);
}

function deleteTask(id) {
  return prisma.deleteTask({ id });
}

export default {
  getTaskList,
  createTask,
  updateTask,
  deleteTask,
};
