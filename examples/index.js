process.env.NODE_ENV = 'development';

const { createHoney } = require('../dist');

const honey = createHoney(
  '6247',
  'postgresql://postgres:12345678@localhost:5432/honey?schema=public'
);

honey.get({
  resource: 'posts',
  fields: ['id', 'name'],
  filter: {
    name: {
      operator: 'like',
      value: 'string'
    }
  },
  format: {
    sort: 'ASC',
    sortField: 'name'
  }
});

honey.getById({
  resource: 'posts',
  fields: ['id', 'name']
});

honey.create({
  resource: 'posts',
  params: {
    name: 'string'
  },
  message: 'User created'
});

honey.updateById({
  resource: 'posts',
  params: {
    name: 'replace'
  },
  message: 'User updated'
});

honey.update({
  resource: 'posts',
  params: {
    name: 'replace'
  },
  filter: {
    name: {
      operator: 'like',
      value: 'string',
      location: 'body'
    }
  },
  message: 'User updated'
});

honey.upsertById({
  resource: 'posts',
  params: {
    name: 'replace'
  },
  message: 'User upserted'
});

honey.deleteById({
  resource: 'posts',
  message: 'User deleted'
});

honey.startServer();
