import jwt from 'jsonwebtoken';
import Boom from '@hapi/boom';
import config from '../config';
import { prisma } from '../models/prisma-client';

export default async function authenticate(req, res, next) {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (!token) {
    throw Boom.unauthorized('No token provided');
  }
  const { secretKey } = config.jwt;
  try {
    const decoded = jwt.verify(token, secretKey);
    const account = await prisma.account({ id: decoded.id });
    if (!account) {
      throw Boom.unauthorized('Access token is expired');
    }
    req.user = decoded;
  } catch (err) {
    throw Boom.unauthorized('Invalid access token');
  }
  next();
}
