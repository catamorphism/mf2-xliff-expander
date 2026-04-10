export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export function assert(condition: any, msg: string) {
  if (!condition)
    throw new AssertionError(msg);
}
