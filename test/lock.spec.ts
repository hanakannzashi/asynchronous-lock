import { Lock } from '../src';

const SLEEP_INTERVAL = 1000;
const MAX_SLEEP_INTERVAL = 1005;

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

test('Promises without lock', async () => {
  const start = Date.now();

  await Promise.all([sleep(SLEEP_INTERVAL), sleep(SLEEP_INTERVAL), sleep(SLEEP_INTERVAL), sleep(SLEEP_INTERVAL)]);

  const cost = Date.now() - start;

  expect(cost).toBeGreaterThanOrEqual(SLEEP_INTERVAL);
  expect(cost).toBeLessThan(MAX_SLEEP_INTERVAL);
});

test('Promises with 1 lock', async () => {
  const lock = new Lock();

  const start = Date.now();

  await Promise.all([
    lock.process(() => sleep(SLEEP_INTERVAL)),
    lock.process(() => sleep(SLEEP_INTERVAL)),
    lock.process(() => sleep(SLEEP_INTERVAL)),
    lock.process(() => sleep(SLEEP_INTERVAL)),
  ]);

  const cost = Date.now() - start;

  expect(cost).toBeGreaterThanOrEqual(SLEEP_INTERVAL * 4);
  expect(cost).toBeLessThan(MAX_SLEEP_INTERVAL * 4);
});

test('Promises with 2 locks', async () => {
  const lock1 = new Lock();
  const lock2 = new Lock();

  const start = Date.now();

  await Promise.all([
    lock1.process(() => sleep(SLEEP_INTERVAL)),
    lock1.process(() => sleep(SLEEP_INTERVAL)),
    lock2.process(() => sleep(SLEEP_INTERVAL)),
    lock2.process(() => sleep(SLEEP_INTERVAL)),
  ]);

  const cost = Date.now() - start;

  expect(cost).toBeGreaterThanOrEqual(SLEEP_INTERVAL * 2);
  expect(cost).toBeLessThan(MAX_SLEEP_INTERVAL * 2);
});
