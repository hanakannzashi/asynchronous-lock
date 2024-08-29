export class Database {
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

export async function increase(database: Database) {
  const count = await database.read();
  await database.write(count + 1);
}

export async function wait() {}
