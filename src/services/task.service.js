import moment from 'moment';
import { prisma } from '../models/prisma-client';
import { taskListType } from '../config/constants';

async function getTaskList(accountId) {
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
        account: {
          id: accountId,
        },
      },
      orderBy: 'updatedAt_ASC',
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
  const { account, steps, images, category, ...otherData } = data;
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

export default {
  getTaskList,
  createTask,
};
