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

  static fromBoolean<T>(
    pass: boolean,
    type: T,
    message?: Stringable,
  ): RuleRunReturn<T> {
    return RuleRunReturn.create(pass, type, message);
  }

  static fromRuleRunReturn<T>(res: RuleRunReturn<T>): RuleRunReturn<T> {
    return RuleRunReturn.create(res.pass, res.type, res.message);
  }

  static create<T>(
    pass: boolean | RuleRunReturn<T>,
    type: T,
    message?: Stringable,
  ): RuleRunReturn<T> {
    if (isBoolean(pass)) {
      return new RuleRunReturn(!!pass, type, dynamicValue(message, type));
    }
    return RuleRunReturn.createFromObject(pass, type, message);
  }

  private static createFromObject<T>(
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
