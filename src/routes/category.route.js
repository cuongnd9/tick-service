import express from 'express';
import { celebrate, Joi } from 'celebrate';
import authorize from '@/helpers/authorize';
import withController from '@/helpers/withController';
import { role } from '@/config/constants';
import controller from '@/controllers/category.controller';

const router = express.Router();

router.get(
  '/',
  authorize(role.free, role.premium),
  celebrate({ query: { keyword: Joi.string() } }),
  withController(controller.list),
);

router.post(
  '/',
  authorize(role.free, role.premium),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
    }),
  }),
  withController(controller.create),
);

router.put(
  '/:id',
  authorize(role.free, role.premium),
  celebrate({
    params: {
      id: Joi.string().required(),
    },
    body: Joi.object().keys({
      index: Joi.number().allow(null),
      name: Joi.string().required(),
    }),
  }),
  withController(controller.update),
);

router.delete(
  '/:id',
  authorize(role.free, role.premium),
  celebrate({
    params: {
      id: Joi.string().required(),
    },
  }),
  withController(controller.destroy),
);

export default router;
