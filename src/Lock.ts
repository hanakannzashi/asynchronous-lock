/**
 * Non-reentrant, mutual-exclusive, fair lock
 * that allows multiple asynchronous processes
 * to execute synchronously.
 */
export class Lock {
  private state: boolean;
  private readonly queue: (() => void)[];

  private constructor() {
    this.state = false;
    this.queue = [];
  }

  static new(): Lock {
    return new Lock();
  }

  async with<R>(process: () => R | PromiseLike<R>): Promise<R> {
    await this.acquire();
    try {
      return await process();
    } finally {
      this.release();
    }
  }

  private async acquire() {
    if (this.tryAcquire()) {
      return;
    }
    await this.wait();
  }

  private tryAcquire(): boolean {
    return this.state ? false : (this.state = true);
  }

  private async wait() {
    await new Promise<void>((resolve) => this.queue.push(() => resolve()));
  }

  private release() {
    const notify = this.queue.shift();
    notify ? notify() : (this.state = false);
  }
}
