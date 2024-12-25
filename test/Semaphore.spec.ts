import { Semaphore } from '../src';
import { Database, increase } from './common';

test('Semaphore', async () => {
  const database = Database.create();

  const semaphore = Semaphore.new();

  await Promise.all([
    semaphore.with(() => increase(database)),
    semaphore.with(() => increase(database)),
    semaphore.with(() => increase(database)),
    semaphore.with(() => increase(database)),
    semaphore.with(() => increase(database)),
  ]);

  const count = await database.read();
  expect(count).toEqual(5);
});
