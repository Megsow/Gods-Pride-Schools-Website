export function getNestedValue(object, path) {
  if (!object || !path) {
    return undefined;
  }
  return path.split('.').reduce((value, key) => {
    if (value && Object.prototype.hasOwnProperty.call(value, key)) {
      return value[key];
    }
    return undefined;
  }, object);
}

export function setNestedText(element, value, { html = false } = {}) {
  if (!(element instanceof Element)) {
    return;
  }
  if (value === undefined || value === null) {
    return;
  }
  if (html) {
    element.innerHTML = value;
  } else {
    element.textContent = value;
  }
}
