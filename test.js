const createHoney = require('./dist');

const honey = createHoney(
  '3000',
  'postgresql://postgres:H0n3y!!2o22!@honey.zhaptek.com:4055/postgres?schema=public'
);

honey.get('users', { me: 'inc' });

honey.startServer();
