module.exports = (source, clone) => {
  const queue = [[source, clone]];

  outer: while (queue.length) {
    const [source, clone] = queue.shift();

    if (!source || typeof source !== 'object') {
      if (typeof clone !== 'function') {
        if (clone !== source) {
          return {
            pass: false,
            message: () => 'Source and clone are not identical',
          };
        }
      }
      continue;
    }

    if (clone === source) {
      return {
        pass: false,
        message: () =>
          `Source and clone are the same object. Expected a deep copy. ${JSON.stringify(
            source
          )}===${JSON.stringify(clone)}`,
      };
    }

    // Short circuit
    if (
      (clone && !source) ||
      (source && !clone) ||
      typeof source !== typeof clone
    ) {
      return {
        pass: false,
        message: () =>
          `Source and clone are not of the same type: ${JSON.stringify(
            source
          )} does not equal ${JSON.stringify(clone)}`,
      };
    }

    if (Array.isArray(source)) {
      // Short circuit
      if (!Array.isArray(clone) || source.length !== clone.length) {
        return {
          pass: false,
          message: () =>
            `source and clone arrays are not identical. ${JSON.stringify(
              source
            )} does not equal ${JSON.stringify(clone)}`,
        };
      }
      source.forEach((v, i) => {
        queue.push([source[i], clone[i]]);
      });
    } else if (typeof source === 'object') {
      Object.keys(source).forEach(key => queue.push([source[key], clone[key]]));
    }

    continue outer;
  }

  return { pass: true };
};
