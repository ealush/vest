function throwError(message) {
  throw new Error(`[${LIBRARY_NAME}]: ${message}`);
}

export default throwError;
