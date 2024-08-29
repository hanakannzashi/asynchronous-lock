import { Lock } from '../src';
import { Database, increase } from './common';

test('Lock', async () => {
  // Create a database
  const database = Database.create();

  // Create a lock
  const lock = Lock.new();

  // Execute asynchronously
  await Promise.all([
    lock.with(() => increase(database)),
    lock.with(() => increase(database)),
    lock.with(() => increase(database)),
    lock.with(() => increase(database)),
    lock.with(() => increase(database)),
  ]);

  // Check result
  const count = await database.read();
  expect(count).toEqual(5);
});
