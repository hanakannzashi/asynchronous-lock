/**
 * Non-reentrant, mutual-exclusive, fair lock
 * that allows multiple asynchronous processes
 * to access multiple resources synchronously.
 */
export class MultiResourceLock<T> {
  private readonly values: T[];
  private readonly states: boolean[];
  private readonly queue: ((indexes: number[]) => void)[];
  private readonly permits: number[];

  private constructor(values: T[]) {
    this.values = Array.from(values);
    this.states = values.map(() => false);
    this.queue = [];
    this.permits = [];
  }

  static new<T>(values: T[]): MultiResourceLock<T> {
    return new MultiResourceLock(values);
  }

  async with<R>(process: (value: T, setValue: (value: T) => void) => R | PromiseLike<R>): Promise<R> {
    const [index] = await this.acquire(1);
    try {
      return await process(this.values[index], (value) => (this.values[index] = value));
    } finally {
      this.release([index]);
    }
  }

  async withMany<R>(
    process: (values: T[], setValues: ((value: T) => void)[]) => R | PromiseLike<R>,
    permit?: number,
  ): Promise<R> {
    const indexes = await this.acquire(permit ?? this.values.length);
    try {
      return await process(
        indexes.map((index) => this.values[index]),
        indexes.map((index) => (value) => (this.values[index] = value)),
      );
    } finally {
      this.release(indexes);
    }
  }

  private async acquire(permit: number): Promise<number[]> {
    const indexes = this.tryAcquire(permit);
    if (indexes) {
      return indexes;
    }
    return this.wait(permit);
  }

  private tryAcquire(permit: number): number[] | undefined {
    const indexes = this.getAcquirable().slice(0, permit);
    if (indexes.length < permit) {
      return undefined;
    }
    indexes.forEach((index) => (this.states[index] = true));
    return indexes;
  }

  private async wait(permit: number): Promise<number[]> {
    return new Promise<number[]>((resolve) => {
      this.queue.push((indexes) => resolve(indexes));
      this.permits.push(permit);
    });
  }

  private release(indexes: number[]) {
    indexes = this.getAcquirable().concat(indexes);

    while (this.queue.length > 0 && indexes.length > 0) {
      const notify = this.queue[0];
      const permit = this.permits[0];

      if (indexes.length < permit) {
        break;
      }

      this.queue.shift();
      this.permits.shift();

      notify(indexes.splice(0, permit));
    }

    indexes.forEach((index) => (this.states[index] = false));
  }

  private getAcquirable(): number[] {
    const indexes: number[] = [];

    this.states.forEach((state, index) => {
      if (state) {
        return;
      }
      indexes.push(index);
    });

    return indexes;
  }
}
