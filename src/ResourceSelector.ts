import { ResourceLock } from './ResourceLock';
import { Unselect } from './types';

/**
 * Allows multiple asynchronous processes to access multiple resources synchronously.
 */
export class ResourceSelector<T> {
  private readonly _resources: ResourceLock<T>[];

  constructor(resources: T[]) {
    this._resources = resources.map((resource) => new ResourceLock<T>(resource));
  }

  async select(): Promise<[T, Unselect]> {
    while (true) {
      let result: [T, Unselect] | undefined;

      for (const _resource of this._resources) {
        const resource = _resource.tryAcquire();
        if (resource !== undefined) {
          result = [resource, () => _resource.release()];
          break;
        }
      }

      if (result) {
        return result;
      }

      await awaited();
    }
  }

  async process<R>(process: (resource: T) => R | PromiseLike<R>): Promise<R> {
    const [resource, unselect] = await this.select();
    try {
      return await process(resource);
    } finally {
      unselect();
    }
  }
}

export async function awaited() {}
