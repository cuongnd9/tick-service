import cron from 'node-cron';
import moment from 'moment';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import { prisma } from '../models/prisma-client';
import { sendEmail } from '../services/mail.service';
import { stepStatus, taskStatus } from '../config/constants';
import config from '../config';

function handleCalculateReport(taskList) {
  let content = '';
  taskList.forEach(task => {
    let doneProcess = '';
    if (task.steps.length === 0) {
      doneProcess = task.status === taskStatus.done ? '100' : '0';
    } else {
      doneProcess = (
        (task.steps.filter(step => step.status === stepStatus.done) * 100) /
        task.steps.length
      ).toFixed(2);
    }
    const title = `- ${task.title}: <span style="color:#ff7e67;">${doneProcess}%</span>\n`;
    content += title;
    if (task.steps.length === 0) return;
    task.steps.forEach(step => {
      content += `+ ${step.title}: ${step.status}\n`;
    });
  });
  return content;
}

function createMailHtml(taskList) {
  const html = fs.readFileSync(`${__dirname}/../templates/report.html`, 'utf8');
  const dom = new JSDOM(html);
  const time = `Hello! This is a report for last week (${moment()
    .subtract(7, 'days')
    .format('MMM Do')} - ${moment().format('MMM Do')})`;
  dom.window.document.getElementById('time').innerHTML = time;
  dom.window.document.getElementById('content').innerHTML = handleCalculateReport(taskList);
  dom.serialize();
  return dom.window.document.documentElement.outerHTML;
}

async function reportAllTasks() {
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
    steps {
      id
      index
      title
      status
      createdAt
      updatedAt
    }
    account {
      email
    }
  }
  `;
  const FROM = moment().subtract(7, 'days');
  const TO = moment();
  const accountList = await prisma.accounts();
  const promiseList = accountList.map(async account => {
    const baseList = await prisma
      .tasks({
        where: {
          account: {
            id: account.id,
          },
        },
      })
      .$fragment(fragment);
    const list = baseList.filter(item => {
      return moment(item.reminderDate).isBetween(FROM, TO);
    });

    if (list.length === 0) return;

    await sendEmail({
      from: `"Cuong Duy Nguyen 👻" ${config.email}`,
      to: account.email,
      subject: `[Tick ✔️] Report every week (${moment()
        .subtract(7, 'days')
        .format('MMM Do')} - ${moment().format('MMM Do')})`,
      html: createMailHtml(list),
    });
  });
  await Promise.all(promiseList);
}

function excuteCron() {
  cron.schedule('* 5 * * 6', async () => {
    await reportAllTasks();
  });
}

export default excuteCron;
