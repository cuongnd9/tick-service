import express from 'express';
import { celebrate, Joi } from 'celebrate';
import authorize from '../helpers/authorize';
import objectToArray from '../helpers/objectToArray';
import withController from '../helpers/withController';
import controller from '../controllers/task.controller';
import { role, taskStatus, taskPriority, stepStatus } from '../config/constants';

const router = express.Router();

router.get(
  '/',
  authorize(role.free, role.premium),
  celebrate({
    query: {
      // keyword: title
      keyword: Joi.string().allow(''),
      categoryIdList: Joi.array().items(
        Joi.string()
          .guid()
          .allow(''),
      ),
      statusList: Joi.array().items(
        Joi.string()
          .valid(objectToArray(taskStatus))
          .allow(''),
      ),
      priorityList: Joi.array().items(
        Joi.string()
          .valid(objectToArray(taskPriority))
          .allow(''),
      ),
      isImportantList: Joi.array().items(
        Joi.boolean()
          .allow(null)
          .allow(''),
      ),
    },
  }),
  withController(controller.list),
);

router.post(
  '/',
  authorize(role.free, role.premium),
  celebrate({
    body: {
      index: Joi.number().integer(),
      title: Joi.string().required(),
      description: Joi.string().allow(''),
      status: Joi.string()
        .valid(objectToArray(taskStatus))
        .default(taskStatus.todo),
      priority: Joi.string()
        .valid(objectToArray(taskPriority))
        .default(taskPriority.medium),
      isImportant: Joi.boolean().default(false),
      dueDate: Joi.date().required(),
      reminderDate: Joi.date(),
      doSendMail: Joi.boolean().default(false),
      category: Joi.string()
        .guid()
        .required(),
      steps: Joi.array().items({
        title: Joi.string().required(),
        status: Joi.string()
          .valid(objectToArray(stepStatus))
          .default(stepStatus.todo),
      }),
      images: Joi.array().items(Joi.string().guid()),
    },
  }),
  withController(controller.create),
);

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
      index: Joi.number().integer(),
      title: Joi.string(),
      description: Joi.string().allow(''),
      status: Joi.string()
        .valid(objectToArray(taskStatus))
        .default(taskStatus.todo),
      priority: Joi.string()
        .valid(objectToArray(taskPriority))
        .default(taskPriority.medium),
      isImportant: Joi.boolean().default(false),
      dueDate: Joi.date(),
      reminderDate: Joi.date(),
      doSendMail: Joi.boolean().default(false),
      category: Joi.string().guid(),
      steps: Joi.object().keys({
        newSteps: Joi.array().items({
          title: Joi.string().required(),
          status: Joi.string()
            .valid(objectToArray(stepStatus))
            .default(stepStatus.todo),
        }),
        deleteSteps: Joi.array().items(
          Joi.string()
            .guid()
            .required(),
        ),
      }),
      images: Joi.object().keys({
        newImages: Joi.array().items(
          Joi.string()
            .guid()
            .required(),
        ),
        deleteImages: Joi.array().items(
          Joi.string()
            .guid()
            .required(),
        ),
      }),
    },
  }),
  withController(controller.update),
);

router.delete(
  '/:id',
  authorize(role.free, role.premium),
  celebrate({
    params: {
      id: Joi.string()
        .guid()
        .required(),
    },
  }),
  withController(controller.destroy),
);

export default router;
