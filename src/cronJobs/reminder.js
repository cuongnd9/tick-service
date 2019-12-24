import cron from 'node-cron';
import moment from 'moment';
import { prisma } from '../models/prisma-client';
import { sendEmail } from '../services/mail.service';
import { taskStatus } from '../config/constants';
import config from '../config';

async function getAllTasks() {
  const baseList = await prisma.tasks({
    where: {
      status_in: [taskStatus.todo, taskStatus.inProcess],
    },
  });
  const FROM = moment();
  const TO = moment().add(1, 'hours');
  const list = baseList.filter(item => {
    return moment(item.reminderDate).isBetween(FROM, TO);
  });
  const promiseList = list.map(async item => {
    await sendEmail({
      from: `"Cuong Duy Nguyen 👻" ${config.email}`,
      to: 'ndc07.it@gmail.com',
      subject: `[Tick ✔️] Remider your task - ${item.title}`,
      html: `<p>${item.title}</p>`,
    });
  });
  await Promise.all(promiseList);
}

function excuteCron() {
  cron.schedule('*/59 0-23 * * *', async () => {
    await getAllTasks();
  });
}

export default excuteCron;
