# Asynchronous Lock
This package provides multiple locks for synchronizing asynchronous processes

## Install
```shell
pnpm add asynchronous-lock
```

## Why Need Lock
We must know why do we need locks in JavaScript which is a single-threaded language, here is an example

1. Mock a database that has two asynchronous functions `read` and `write`

    ```ts
    class Database {
      private count: number;
      
      private constructor() {
        this.count = 0;
      }
      
      static create(): Database {
        return new Database();
      }
      
      async read(): Promise<number> {
        return this.count;
      }
      
      async write(count: number) {
        this.count = count;
      }
    }
    ```

2. Define `increase` function that can increase `count` in database

    ```ts
    async function increase(database: Database) {
      const count = await database.read();
      await database.write(count + 1);
    }
    ```

3. Test asynchronously

    ```ts
    async function test() {
      // Create a database
      const database = Database.create();
    
      // Execute asynchronously
      await Promise.all([
        increase(database),
        increase(database),
        increase(database),
        increase(database),
        increase(database),
      ]);
    
      // Check result
      const count = await database.read();
      console.log(count); // Unexpected result 1 (expect to be 5)
    }
    ```

Asynchronous executions may cause unexpected result, that's why we need locks in JavaScript

## Usage

* `Lock`: See [Lock.spec.ts](./test/Lock.spec.ts)
* `ResourceLock`: See [ResourceLock.spec.ts](./test/ResourceLock.spec.ts)
* `MultiResourceLock`: See [MultiResourceLock.spec.ts](./test/MultiResourceLock.spec.ts)
