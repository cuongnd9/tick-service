import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { code } from 'thinid';
import nodemailer from 'nodemailer';
import Boom from '@hapi/boom';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import { promisify } from 'util';
import { prisma } from '@/models/prisma-client';
import config from '@/config';
import { accountStatus } from '@/config/constants';

function createMailHtml(codeConfirmation) {
  const html = fs.readFileSync(`${__dirname}/../templates/codeConfirmation.html`, 'utf8');
  const dom = new JSDOM(html);
  dom.window.document.getElementById('code').innerHTML = codeConfirmation;
  dom.serialize();
  return dom.window.document.documentElement.outerHTML;
}

async function sendMail(codeConfirmation) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ndc07.it@gmail.com',
      pass: 'ndc01648222347',
    },
  });
  const mailContent = {
    from: '"Cuong Duy Nguyen 👻" ndc07.it@gmail.com',
    to: 'cuongw.me@gmail.com',
    subject: '[Tick ✔️] Verify your email address',
    html: createMailHtml(codeConfirmation),
  };
  await transporter.sendMail(mailContent);
}

async function register(redis, data) {
  const { password } = data;
  const hashPassword = await bcrypt.hash(password, 10);
  const newData = {
    ...data,
    password: hashPassword,
  };
  const newAccount = await prisma.createAccount(newData);
  const codeConfirmation = code();
  // Save code confirmation to Redis.
  await redis.set(newAccount.id, codeConfirmation, 'PX', config.registerExpiration);
  // Send code confirmation by mail.
  await sendMail(codeConfirmation);
  return _.omit(newAccount, ['password']);
}

async function checkCodeConfirmation(redis, data) {
  const { accountId, code: codeConfirmation } = data;
  const getAsync = promisify(redis.get).bind(redis);
  const redisCodeConfirmation = await getAsync(accountId);
  if (!redisCodeConfirmation) {
    throw Boom.clientTimeout('code is time out');
  }
  if (redisCodeConfirmation.toString() === codeConfirmation.toString()) {
    const account = await prisma.updateAccount({
      where: {
        id: accountId,
      },
      data: {
        status: accountStatus.active,
      },
    });
    return _.omit(account, ['password']);
  }
  throw Boom.notFound('code is incorrect');
}

async function login(data) {
  const { username, password } = data;
  const account = await prisma.account({ username });
  if (!account) {
    throw Boom.notFound('username does not exist');
  }
  const match = await bcrypt.compare(password, account.password);
  if (!match) {
    throw Boom.unauthorized('password is incorrect');
  }
  const { id, role } = account;
  const { secretKey, expiresIn, algorithm } = config.jwt;
  const payload = {
    id,
    role,
  };
  const token = jwt.sign(payload, secretKey, { algorithm, expiresIn });
  return {
    token,
    account: _.omit(account, ['password']),
  };
}

export default {
  register,
  checkCodeConfirmation,
  login,
};
