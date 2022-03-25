import { CronJob } from 'cron';

interface ICronConfig {
  start: boolean;
  tz: string;
  runNow: boolean;
}

class Cron {
  private config: ICronConfig;

  constructor(config: ICronConfig) {
    this.config = config;
  }

  schedule(task: () => void, time: string, name: string) {
    return new CronJob(
      time,
      () => {
        console.log(`Executing Job "${name}"...`);
        task();
      },
      null,
      this.config.start,
      this.config.tz,
      this,
      this.config.runNow
    );
  }
}

export default Cron;
