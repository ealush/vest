const collector = () => {
  const collection = [];

  const collect = (...args) => {
    args.forEach(value => collection.push(value));
  };

  collect.collection = collection;

  return collect;
};

export default collector;
