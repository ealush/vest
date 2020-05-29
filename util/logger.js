module.exports = {
  log: console.log, // eslint-disable-line no-console
  info: console.info, // eslint-disable-line no-console
  error: message => {
    setTimeout(() => {
      throw message;
    });
  },
};
