const collector = () => {
  const collection = [];

  const collect = val => {
    collection.push(val);
    return val;
  };

  collect.collection = collection;

  return collect;
};

export default collector;
