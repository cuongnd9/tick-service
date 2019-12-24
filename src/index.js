import express from 'express';
import redis from 'redis';
import signale from 'signale';
import apiRoute from './routes';
import config from './config';
import excuteReminder from './cronJobs/reminder';
import excuteReport from './cronJobs/report';

// Initialize express app
const app = express();

// Initialize redis client.
const redisClient = redis.createClient({
  ...config.redis,
});
app.locals.redis = redisClient;

// Routes.
app.get('/', (req, res) => res.send('<p>👋🇻🇳 Xin chào</p>'));
app.use('/api', apiRoute);

// Excute cron jobs.
excuteReminder();
excuteReport();

// Start server.
app.listen(config.port, () => signale.watch(`Server started on http://localhost:${config.port}`));
