export class Semaphore {
  private permit: number;
  private readonly notifiers: (() => void)[];

  private constructor(permit: number) {
    this.permit = permit;
    this.notifiers = [];
  }

  static new(permit = 1): Semaphore {
    return new Semaphore(permit);
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
