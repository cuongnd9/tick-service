import express from 'express';
import { uid } from 'thinid';
import { celebrate, Joi } from 'celebrate';
import withController from '@/helpers/withController';
import controller from '@/controllers/account.controller';
import { role, accountStatus } from '@/config/constants';

const router = express.Router();

router.post(
  '/register',
  celebrate({
    body: Joi.object().keys({
      username: Joi.string().default(uid()),
      password: Joi.string().required(),
      email: Joi.string()
        .email()
        .required(),
      role: Joi.string()
        .valid(role)
        .default(role.free),
      status: Joi.string()
        .valid(accountStatus)
        .default(accountStatus.pending),
    }),
  }),
  withController(controller.register),
);
router.get(
  '/check-code',
  celebrate({
    query: Joi.object().keys({
      code: Joi.number().required(),
      accountId: Joi.string()
        .guid()
        .required(),
    }),
  }),
  withController(controller.checkCodeConfirmation),
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
