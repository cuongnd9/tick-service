import fs from 'fs';
import FormData from 'form-data';
import { prisma } from '../models/prisma-client';
import request from '../helpers/request';
import config from '../config';

async function createImage(files, accountId) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append(
      'images',
      fs.createReadStream(`${__dirname}/../../${file.path}`),
      file.originalname,
    );
  });
  const { data: imageData } = await request('/api/image/upload-multi', {
    method: 'POST',
    headers: {
      ...formData.getHeaders(),
      cloud_name: config.imageService.cloudName,
      api_key: config.imageService.apiKey,
      api_secret: config.imageService.apiSecret,
    },
    data: formData,
  });
  const clearedImages = files.map(file => fs.unlinkSync(`${__dirname}/../../${file.path}`));
  await Promise.all(clearedImages);
  const createdImages = imageData.map(image =>
    prisma.createImage({
      publicId: image.public_id,
      url: image.url,
      account: {
        connect: {
          id: accountId,
        },
      },
    }),
  );
  const images = await Promise.all(createdImages);
  return images;
}

export default { createImage };
