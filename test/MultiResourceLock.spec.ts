import { MultiResourceLock } from '../src';
import { Database, increase } from './common';

test('MultiResourceLock', async () => {
  // Create databases with lock
  const lock = MultiResourceLock.new([Database.create(), Database.create()]);

  // Execute asynchronously
  await Promise.all([
    lock.with((database) => increase(database)),
    lock.with((database) => increase(database)),
    lock.with((database) => increase(database)),
    lock.with((database) => increase(database)),
    lock.with((database) => increase(database)),
  ]);

  // Check result
  const count = await lock.withMany(async (databases) => {
    let count = 0;
    for (const database of databases) {
      count += await database.read();
    }
    return count;
  });
  expect(count).toEqual(5);
});
