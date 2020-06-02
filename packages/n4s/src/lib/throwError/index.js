function throwError(message) {
  setTimeout(() => {
    throw new Error(`[${LIBRARY_NAME}]: ${message}`);
  });
}

export default throwError;
