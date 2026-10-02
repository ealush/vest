export interface AvailabilityService {
  isAvailable(value: string, signal?: AbortSignal): Promise<boolean>;
}

export function createAvailabilityService(
  unavailableValues: readonly string[] = ['taken'],
): AvailabilityService {
  return {
    async isAvailable(value) {
      await Promise.resolve();
      return !unavailableValues.includes(value);
    },
  };
}
