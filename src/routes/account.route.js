import express from 'express';
import { celebrate, Joi } from 'celebrate';
import objectToArray from '../helpers/objectToArray';
import withController from '../helpers/withController';
import controller from '../controllers/account.controller';
import { role, accountStatus } from '../config/constants';

const router = express.Router();
router.get(
  '/require-code',
  celebrate({
    query: Joi.object().keys({
      email: Joi.string()
        .email()
        .required(),
    }),
  }),
  withController(controller.requireCode),
);

router.get(
  '/check-code',
  celebrate({
    query: Joi.object().keys({
      code: Joi.number().required(),
      email: Joi.string()
        .email()
        .required(),
    }),
  }),
  withController(controller.checkCode),
);

router.post(
  '/register',
  celebrate({
    query: Joi.object().keys({
      code: Joi.number().required(),
      email: Joi.string()
        .email()
        .required(),
    }),
    body: Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required(),
      role: Joi.string()
        .valid(objectToArray(role))
        .default(role.free),
      status: Joi.string()
        .valid(objectToArray(accountStatus))
        .default(accountStatus.active),
    }),
  }),
  withController(controller.register),
);

router.post(
  '/login',
  celebrate({
    body: Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  withController(controller.login),
);

export default router;
