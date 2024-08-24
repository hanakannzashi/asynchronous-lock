import { Process, Resolve } from './types';

/**
 * Allows multiple asynchronous processes to execute synchronously.
 */
export class Lock {
  isAcquired: boolean;
  private readonly resolves: Resolve[];

  constructor() {
    this.isAcquired = false;
    this.resolves = [];
  }

  private next() {
    const resolve = this.resolves.shift();
    if (resolve) {
      this.isAcquired = true;
      resolve();
    }
  }

  /**
   * Try to acquire lock. Will return `false` if lock can not be acquired currently, else return `true`.
   */
  tryAcquire(): boolean {
    return this.isAcquired ? false : (this.isAcquired = true);
  }

  /**
   * Acquire lock. Will wait if lock can not be acquired currently.
   */
  async acquire() {
    if (this.isAcquired) {
      await new Promise<void>((resolve) => this.resolves.push(resolve));
    }
    this.isAcquired = true;
  }

  /**
   * Release lock.
   */
  release() {
    this.isAcquired = false;
    this.next();
  }

  /**
   * Execute process with lock.
   */
  async process<R>(process: Process<R>): Promise<R> {
    await this.acquire();
    try {
      return await process();
    } finally {
      this.release();
    }
  }
}
