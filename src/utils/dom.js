const textFallback = new WeakMap();
const htmlFallback = new WeakMap();

export function setLoadingText(element, placeholder = 'Loading…') {
  if (!(element instanceof Element)) {
    return;
  }
  if (!textFallback.has(element)) {
    textFallback.set(element, element.textContent);
  }
  element.textContent = placeholder;
}

export function setLoadingHTML(element, placeholder = '<p class="loading">Loading…</p>') {
  if (!(element instanceof Element)) {
    return;
  }
  if (!htmlFallback.has(element)) {
    htmlFallback.set(element, element.innerHTML);
  }
  element.innerHTML = placeholder;
}

export function restoreTextFallback(element) {
  if (textFallback.has(element)) {
    element.textContent = textFallback.get(element);
  }
}

export function restoreHTMLFallback(element) {
  if (htmlFallback.has(element)) {
    element.innerHTML = htmlFallback.get(element);
  }
}

export function cacheHtmlFallback(element) {
  if (!(element instanceof Element)) {
    return;
  }
  if (!htmlFallback.has(element)) {
    htmlFallback.set(element, element.innerHTML);
  }
}

export function cacheTextFallback(element) {
  if (!(element instanceof Element)) {
    return;
  }
  if (!textFallback.has(element)) {
    textFallback.set(element, element.textContent);
  }
}
