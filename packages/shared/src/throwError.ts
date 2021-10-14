import defaultTo from 'defaultTo';

/**
 * Throws a timed out error.
 */
export default function throwError(
  devMessage?: string,
  productionMessage?: string
): never {
  throw new Error(
    __DEV__ ? devMessage : defaultTo(productionMessage, devMessage)
  );
}

export function throwErrorDeferred(
  devMessage?: string,
  productionMessage?: string
): void {
  setTimeout(() => {
    throwError(devMessage, productionMessage);
  }, 0);
}
