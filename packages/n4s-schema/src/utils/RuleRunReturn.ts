import { isBoolean, Stringable, dynamicValue } from 'vest-utils';

export class RuleRunReturn<T> {
  pass: boolean;
  type: T;
  message?: string;

  constructor(pass: boolean, type: T, message?: string) {
    this.pass = pass;
    this.type = type;
    this.message = message;
  }

  static create<T>(
    pass: boolean | RuleRunReturn<T>,
    type: T,
    message?: Stringable,
  ): RuleRunReturn<T> {
    if (isBoolean(pass)) {
      return new RuleRunReturn(!!pass, type, dynamicValue(message, type));
    }
    return RuleRunReturn.fromObject(pass, type, message);
  }

  private static fromObject<T>(
    pass: any,
    type: T,
    message?: Stringable,
  ): RuleRunReturn<T> {
    const hasValidObject = pass && isBoolean(pass.pass);

    if (!hasValidObject) {
      return new RuleRunReturn(false, type, dynamicValue(message, type));
    }

    return new RuleRunReturn(
      !!pass.pass,
      type ?? pass.type,
      dynamicValue(message ?? pass.message, type),
    );
  }

  static Passing<T>(type: T, message?: Stringable): RuleRunReturn<T> {
    return RuleRunReturn.create(true, type, message);
  }

  static Failing<T>(type: T, message?: Stringable): RuleRunReturn<T> {
    return RuleRunReturn.create(false, type, message);
  }
}
