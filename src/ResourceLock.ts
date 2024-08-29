/**
 * Non-reentrant, mutual-exclusive, fair lock
 * that allows multiple asynchronous processes
 * to access a resource synchronously.
 */
export class ResourceLock<T> {
  private value: T;
  private state: boolean;
  private readonly queue: (() => void)[];

  private constructor(value: T) {
    this.value = value;
    this.state = false;
    this.queue = [];
  }

  static new<T>(value: T): ResourceLock<T> {
    return new ResourceLock(value);
  }

  async with<R>(process: (value: T, setValue: (value: T) => void) => R | PromiseLike<R>): Promise<R> {
    await this.acquire();
    try {
      return await process(this.value, (value) => (this.value = value));
    } finally {
      this.release();
    }
  }

  private async acquire(): Promise<void> {
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
