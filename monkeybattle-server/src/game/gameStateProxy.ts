export const watch = (object: any, onChange: () => void) => {
  if (object && object.__isWatcherProxy) {
    return object;
  }

  const proxy = new Proxy(object, {
    get(target, property) {
      if (property === '__isWatcherProxy') return true;
      else return target[property];
    },

    set(target, property, value) {
      if (typeof value === 'object' && value !== null)
        target[property] = watch(value, onChange);
      else target[property] = value;

      onChange();

      return true;
    },
  });

  for (const property in object) {
    if (
      object.hasOwnProperty(property) &&
      object[property] &&
      typeof object[property] === 'object'
    )
      object[property] = watch(object[property], onChange);
  }

  return proxy;
};
