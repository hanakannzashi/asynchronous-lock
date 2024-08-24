import { Lock } from './Lock';
import { ResourceProcess } from './types';

/**
 * Allows multiple asynchronous processes to access the same resource synchronously.
 */
export class ResourceLock<T> {
  private readonly resource: T;
  private readonly lock: Lock;

  constructor(resource: T) {
    this.resource = resource;
    this.lock = new Lock();
  }

  get isAcquired(): boolean {
    return this.lock.isAcquired;
  }

  tryAcquire(): T | undefined {
    if (!this.lock.tryAcquire()) {
      return;
    }
    return this.resource;
  }

  async acquire(): Promise<T> {
    await this.lock.acquire();
    return this.resource;
  }

  release() {
    this.lock.release();
  }

  async process<R>(process: ResourceProcess<R, T>): Promise<R> {
    return this.lock.process(() => process(this.resource));
  }
}
