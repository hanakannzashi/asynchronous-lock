import { ResourceLock } from '../src';
import { Database, increase } from './common';

test('ResourceLock', async () => {
  // Create a database with lock
  const lock = ResourceLock.new(Database.create());

  // Execute asynchronously
  await Promise.all([
    lock.with((database) => increase(database)),
    lock.with((database) => increase(database)),
    lock.with((database) => increase(database)),
    lock.with((database) => increase(database)),
    lock.with((database) => increase(database)),
  ]);

  // Check result
  const count = await lock.with((database) => database.read());
  expect(count).toEqual(5);
});
