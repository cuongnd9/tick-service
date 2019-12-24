import express from 'express';
import redis from 'redis';
import signale from 'signale';
import apiRoute from './routes';
import config from './config';
import excuteCron from './cronJobs/reminder';

// Initialize express app
const app = express();

// Initialize redis client.
const redisClient = redis.createClient({
  ...config.redis,
});
app.locals.redis = redisClient;

// Routes.
app.get('/', (req, res) => res.send('<p>👋 Xin chào</p>'));
app.use('/api', apiRoute);

excuteCron();

// Start server.
app.listen(config.port, () => signale.watch(`Server started on http://localhost:${config.port}`));
