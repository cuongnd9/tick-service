import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { numcode } from 'numcode';
import nodemailer from 'nodemailer';
import Boom from '@hapi/boom';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import { promisify } from 'util';
import { prisma } from '@/models/prisma-client';
import config from '@/config';

function createMailHtml(codeConfirmation) {
  const html = fs.readFileSync(`${__dirname}/../templates/codeConfirmation.html`, 'utf8');
  const dom = new JSDOM(html);
  dom.window.document.getElementById('code').innerHTML = codeConfirmation;
  dom.serialize();
  return dom.window.document.documentElement.outerHTML;
}

async function sendEmail(email, codeConfirmation) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email,
      pass: config.emailPassword,
    },
  });
  const mailContent = {
    from: `"Cuong Duy Nguyen 👻" ${config.email}`,
    to: email,
    subject: '[Tick ✔️] Verify your email address',
    html: createMailHtml(codeConfirmation),
  };
  await transporter.sendMail(mailContent);
}

async function requireCode(redis, data) {
  const { email } = data;
  const account = await prisma.account({ email });
  if (account) {
    throw Boom.conflict('email is exist');
  }
  const codeConfirmation = numcode();
  // Save code confirmation to Redis.
  await redis.set(email, codeConfirmation, 'PX', config.registerExpiration);
  // Send code confirmation by mail.
  await sendEmail(email, codeConfirmation);
  return {
    email,
  };
}

async function checkCode(redis, data) {
  const { code: codeConfirmation, email } = data;
  const getAsync = promisify(redis.get).bind(redis);
  const redisCodeConfirmation = await getAsync(email);
  if (!redisCodeConfirmation) {
    throw Boom.clientTimeout('code is expired');
  }
  if (redisCodeConfirmation.toString() !== codeConfirmation.toString()) {
    throw Boom.notFound('code is incorrect');
  }
}

async function register(redis, query, body) {
  const { password, username } = body;
  const { email } = query;
  const accountByEmail = await prisma.account({ email });
  if (accountByEmail) {
    throw Boom.conflict('email is exists');
  }
  const accountByUsername = await prisma.account({ username });
  if (accountByUsername) {
    throw Boom.conflict('username is exists');
  }
  await checkCode(redis, query);
  const hashPassword = await bcrypt.hash(password, 10);
  const newData = {
    ...body,
    password: hashPassword,
    email,
  };
  const newAccount = await prisma.createAccount(newData);
  return _.omit(newAccount, ['password']);
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
  requireCode,
  register,
  login,
};
