const promisify = validatorFn => (...args) => {
  if (typeof validatorFn !== 'function') {
    throw new Error('[vest/promisify]: Expected validatorFn to be a function.');
  }

  return new Promise(resolve => validatorFn(...args).done(resolve));
};

export default promisify;
