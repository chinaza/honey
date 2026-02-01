import { nestResults, NESTED_DELIMITER } from '../postgres';
import { Join } from '../../shared/interface';

describe('nestResults', () => {
  it('should nest results correctly based on joins', () => {
    const results = [
      {
        id: 1,
        firstname: 'John',
        [`posts${NESTED_DELIMITER}id`]: 101,
        [`posts${NESTED_DELIMITER}title`]: 'Post 1'
      },
      {
        id: 1,
        firstname: 'John',
        [`posts${NESTED_DELIMITER}id`]: 102,
        [`posts${NESTED_DELIMITER}title`]: 'Post 2'
      },
      {
        id: 2,
        firstname: 'Jane',
        [`posts${NESTED_DELIMITER}id`]: 103,
        [`posts${NESTED_DELIMITER}title`]: 'Post 3'
      }
    ];

    const joins: Join[] = [
      {
        table: 'posts',
        on: { left: 'users.id', right: 'posts.user_id' }
      }
    ];

    const nested = nestResults(results, joins);

    expect(nested).toHaveLength(2);
    expect(nested[0].id).toBe(1);
    expect(nested[0].firstname).toBe('John');
    expect(nested[0].posts).toHaveLength(2);
    expect(nested[0].posts[0]).toEqual({ id: 101, title: 'Post 1' });
    expect(nested[0].posts[1]).toEqual({ id: 102, title: 'Post 2' });

    expect(nested[1].id).toBe(2);
    expect(nested[1].firstname).toBe('Jane');
    expect(nested[1].posts).toHaveLength(1);
    expect(nested[1].posts[0]).toEqual({ id: 103, title: 'Post 3' });
  });

  it('should handle aliases correctly', () => {
    const results = [
      {
        id: 1,
        firstname: 'John',
        [`user_posts${NESTED_DELIMITER}id`]: 101,
        [`user_posts${NESTED_DELIMITER}title`]: 'Post 1'
      }
    ];

    const joins: Join[] = [
      {
        table: 'posts',
        alias: 'user_posts',
        on: { left: 'users.id', right: 'user_posts.user_id' }
      }
    ];

    const nested = nestResults(results, joins);

    expect(nested[0].user_posts).toHaveLength(1);
    expect(nested[0].user_posts[0]).toEqual({ id: 101, title: 'Post 1' });
  });

  it('should handle results with no join matches (nulls)', () => {
    const results = [
      {
        id: 1,
        firstname: 'John',
        [`posts${NESTED_DELIMITER}id`]: null,
        [`posts${NESTED_DELIMITER}title`]: null
      }
    ];

    const joins: Join[] = [
      {
        table: 'posts',
        type: 'left',
        on: { left: 'users.id', right: 'posts.user_id' }
      }
    ];

    const nested = nestResults(results, joins);

    expect(nested[0].posts).toHaveLength(0);
  });
});
