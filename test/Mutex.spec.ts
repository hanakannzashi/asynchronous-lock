import { Mutex } from '../src';
import { Database, increase } from './common';

test('Mutex', async () => {
  const mutex = Mutex.new(Database.create());

  await Promise.all([
    mutex.with((database) => increase(database)),
    mutex.with((database) => increase(database)),
    mutex.with((database) => increase(database)),
    mutex.with((database) => increase(database)),
    mutex.with((database) => increase(database)),
  ]);

  const count = await mutex.with((database) => database.read());
  expect(count).toEqual(5);
});
