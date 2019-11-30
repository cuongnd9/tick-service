import express from 'express';
import authorize from '../helpers/authorize';
import upload from '../helpers/upload';
import withController from '../helpers/withController';
import { role, maxImage } from '../config/constants';
import controller from '../controllers/image.controller';

const router = express.Router();

router.post(
  '/',
  authorize(role.free, role.premium),
  upload.array('images', maxImage),
  withController(controller.create),
);

export default router;
