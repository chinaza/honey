import { generateWhere } from './postgres';

test('generate where segment of sql query', () => {
  const { where, replacements } = generateWhere({
    name: {
      operator: '=',
      value: 'test'
    },
    $or: {
      age: {
        operator: '>',
        value: 20
      },
      nationality: {
        operator: '=',
        value: 'nigeria'
      }
    }
  });

  expect(where).toBe(`"name" = ? AND ("age" > ? OR "nationality" = ?)`);
  expect(replacements).toEqual(['test', 20, 'nigeria']);
});
