export class Semaphore {
  private permit: number;
  private readonly notifiers: (() => void)[];

  private constructor(permit = 1) {
    this.permit = permit;
    this.notifiers = [];
  }

  static new(n?: number): Semaphore {
    return new Semaphore(n);
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
    if (this.permit > 0) {
      this.permit--;
      return true;
    } else {
      return false;
    }
  }

  private async wait() {
    await new Promise<void>((resolve) => this.notifiers.push(() => resolve()));
  }

  private release() {
    const notify = this.notifiers.shift();
    notify ? notify() : this.permit++;
  }
}
