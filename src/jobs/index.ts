import Config from '../config';

import time from './time';
import Cron from './cron';
import Jobs from './jobs';

let tz = Config.getEnv('TIMEZONE');

if (!tz) tz = 'Europe/London';

const cron = new Cron({
  start: true,
  tz,
  runNow: true
});

export default {
  testJob: cron.schedule(Jobs.testJob, time.everyMinute, 'TEST_JOB')
};
