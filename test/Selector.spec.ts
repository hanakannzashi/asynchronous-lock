import { Selector } from '../src';
import { Database, increase } from './common';

test('Selector', async () => {
  const selector = Selector.new([Database.create(), Database.create()]);

  await Promise.all([
    selector.with((database) => increase(database)),
    selector.with((database) => increase(database)),
    selector.with((database) => increase(database)),
    selector.with((database) => increase(database)),
    selector.with((database) => increase(database)),
  ]);

  const count = await selector.withMany(async (databases) => {
    let count = 0;
    for (const database of databases) {
      count += await database.read();
    }
    return count;
  });
  expect(count).toEqual(5);
});
