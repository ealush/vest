const throwError = (message: string, type: ErrorConstructor = Error) => {
  throw new type(`[Vest]: ${message}`);
};

export default throwError;
