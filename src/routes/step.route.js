import express from 'express';
import { celebrate, Joi } from 'celebrate';
import authorize from '../helpers/authorize';
import withController from '../helpers/withController';
import controller from '../controllers/step.controller';
import { role, stepStatus } from '../config/constants';

const router = express.Router();

router.put(
  '/:id',
  authorize(role.free, role.premium),
  celebrate({
    params: {
      id: Joi.string()
        .guid()
        .required(),
    },
    body: {
      status: Joi.string()
        .valid([stepStatus.todo, stepStatus.done])
        .required(),
    },
  }),
  withController(controller.updateStatus),
);

export default router;
