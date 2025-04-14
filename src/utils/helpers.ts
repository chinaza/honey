export class Singleton {
  private static instances: Map<string, any> = new Map();

  public static getInstance<T>(identifier: string, initFn?: () => T): T {
    if (!this.instances.has(identifier) && initFn) {
      this.instances.set(identifier, initFn());
    }

    return this.instances.get(identifier) as T;
  }
}

export default function createSingleton<T>(
  identifier: string,
  initFn?: () => T
): T {
  return Singleton.getInstance(identifier, initFn);
}
