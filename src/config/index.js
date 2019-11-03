export default {
  port: process.env.PORT || 9000,
  jwt: {
    secretKey: process.env.SECRET_KEY || 'node_boilerplate',
    algorithm: process.env.ALGORITHM || 'HS256',
    expiresIn: process.env.EXPIRES_IN || '30m',
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
  registerExpiration: process.env.REGISTER_EXPIRATION || 300000,
  email: process.env.EMAIL || 'ndc07.it@gmail.com',
  emailPassword: process.env.EMAIL_PASSWORD || 'test',
};
