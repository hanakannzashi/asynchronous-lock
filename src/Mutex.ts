export class Mutex<T> {
  private value: T;
  private flag: boolean;
  private readonly notifiers: (() => void)[];

  private constructor(value: T) {
    this.value = value;
    this.flag = false;
    this.notifiers = [];
  }

  static new<T>(value: T): Mutex<T> {
    return new Mutex(value);
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
    return this.flag ? false : (this.flag = true);
  }

  private async wait() {
    await new Promise<void>((resolve) => this.notifiers.push(() => resolve()));
  }

  private release() {
    const notify = this.notifiers.shift();
    notify ? notify() : (this.flag = false);
  }
}
