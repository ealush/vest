// Shared numeric predicates operating on numbers only.

export function greaterThan(value: number, n: number): boolean {
  return value > n;
}

export function greaterThanOrEquals(value: number, n: number): boolean {
  return value >= n;
}

export function lessThan(value: number, n: number): boolean {
  return value < n;
}

export function lessThanOrEquals(value: number, n: number): boolean {
  return value <= n;
}

export function between(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function isEven(value: number): boolean {
  return Number.isFinite(value) && value % 2 === 0;
}

export function isOdd(value: number): boolean {
  return Number.isFinite(value) && Math.abs(value % 2) === 1;
}

export function isPositive(value: number): boolean {
  return value > 0;
}

export function isNegative(value: number): boolean {
  return value < 0;
}
