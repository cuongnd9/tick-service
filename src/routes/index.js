import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from 'morgan';
import { errors } from 'celebrate';
import Boom from '@hapi/boom';
import authenticate from '../helpers/authenticate';
import errorHandler from '../helpers/errorHandler';
import userRoute from './user.route';
import accountRoute from './account.route';
import imageRoute from './image.route';
import taskRoute from './task.route';
import categoryRoute from './category.route';
import stepRoute from './step.route';

const router = express.Router();

// Body parser.
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
// Enable cors.
router.use(cors());
// Logger.
router.use(logger('dev'));

// API routes.
router.use('/user', authenticate, userRoute);
router.use('/account', accountRoute);
router.use('/image', authenticate, imageRoute);
router.use('/task', authenticate, taskRoute);
router.use('/category', authenticate, categoryRoute);
router.use('/step', authenticate, stepRoute);

// 404 not found.
router.use((req, res, next) => {
  next(Boom.notFound('API not found'));
});

// Celebrate validation errors.
router.use(errors());

// Global errors.
router.use(errorHandler);

export default router;
