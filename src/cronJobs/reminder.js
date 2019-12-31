import cron from 'node-cron';
import moment from 'moment';
import 'moment-timezone';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import { prisma } from '../models/prisma-client';
import { sendEmail } from '../services/mail.service';
import { taskStatus } from '../config/constants';
import config from '../config';

function createMailHtml(task) {
  const html = fs.readFileSync(`${__dirname}/../templates/reminder.html`, 'utf8');
  const dom = new JSDOM(html);
  const message = `Hello! You have a task - ${task.title} at ${moment(task.reminderDate)
    .tz('Asia/Bangkok')
    .format('MMM Do hh:mm A')}`;
  dom.window.document.getElementById('message').innerHTML = message;
  dom.serialize();
  return dom.window.document.documentElement.outerHTML;
}

async function sendAllTasks() {
  const fragment = `
  fragment Props on Task {
    id
    index
    title
    description
    status
    priority
    isImportant
    dueDate
    reminderDate
    account {
      email
    }
  }
  `;
  const baseList = await prisma
    .tasks({
      where: {
        status_in: [taskStatus.todo, taskStatus.inProcess],
      },
    })
    .$fragment(fragment);
  const FROM = moment();
  const TO = moment().add(1, 'hours');
  const list = baseList.filter(item => {
    return moment(item.reminderDate).isBetween(FROM, TO);
  });
  const promiseList = list.map(async item => {
    await sendEmail({
      from: `"Cuong Duy Nguyen 👻" ${config.email}`,
      to: item.account.email,
      subject: `[Tick ✔️] Remider your task - ${item.title}`,
      html: createMailHtml(item),
    });
  });
  await Promise.all(promiseList);
}

function excuteCron() {
  cron.schedule('*/59 0-23 * * *', async () => {
    await sendAllTasks();
  });
}

export default excuteCron;
