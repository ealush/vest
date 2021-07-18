export {};

declare global {
  namespace jest {
    interface It {
      withContext: (
        message: string,
        cb: () => void,
        getCTX?: () => Record<string, any>
      ) => void;
    }
  }
}
