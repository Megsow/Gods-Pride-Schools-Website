import { useDocument, useCollection } from '../hooks/useFirestore.js';
import { getNestedValue, setNestedText } from './object.js';
import {
  setLoadingText,
  setLoadingHTML,
  restoreTextFallback,
  restoreHTMLFallback,
  cacheHtmlFallback,
  cacheTextFallback,
} from './dom.js';

function parseOrderBy(value) {
  if (!value) {
    return undefined;
  }
  return value.split(',').map(token => {
    const [field, direction] = token.split(':').map(part => part.trim());
    return [field, direction || 'asc'];
  });
}

export async function hydrateDocumentFields() {
  const elements = Array.from(document.querySelectorAll('[data-document][data-field]'));
  if (!elements.length) {
    return;
  }

  const groups = elements.reduce((acc, element) => {
    const docPath = element.dataset.document;
    if (!docPath) {
      return acc;
    }
    if (!acc.has(docPath)) {
      acc.set(docPath, []);
    }
    acc.get(docPath).push(element);
    return acc;
  }, new Map());

  await Promise.all(
    Array.from(groups.entries()).map(async ([docPath, nodes]) => {
      nodes.forEach(node => {
        const type = node.dataset.fieldType;
        const attr = node.dataset.attr;
        if (attr) {
          if (!node.dataset.attrFallback) {
            node.dataset.attrFallback = node.getAttribute(attr) || '';
          }
        } else if (type === 'html') {
          setLoadingHTML(node);
        } else {
          setLoadingText(node);
        }
      });

      const { data, error } = await useDocument(docPath);

      nodes.forEach(node => {
        const type = node.dataset.fieldType;
        const field = node.dataset.field;
        const attr = node.dataset.attr;
        const fallback = node.dataset.fallback;
        const defaultValue = fallback !== undefined ? fallback : null;

        if (!data || error) {
          if (attr) {
            node.setAttribute(attr, node.dataset.attrFallback || '');
          } else if (type === 'html') {
            restoreHTMLFallback(node);
          } else {
            restoreTextFallback(node);
          }
          return;
        }

        const value = getNestedValue(data, field);
        if (attr) {
          const attrValue = value ?? defaultValue ?? node.dataset.attrFallback;
          if (attrValue !== undefined && attrValue !== null) {
            node.setAttribute(attr, attrValue);
          }
        } else if (type === 'html') {
          if (value !== undefined && value !== null) {
            cacheHtmlFallback(node);
            node.innerHTML = value;
          } else {
            restoreHTMLFallback(node);
          }
        } else {
          if (value !== undefined && value !== null) {
            cacheTextFallback(node);
            setNestedText(node, value);
          } else {
            restoreTextFallback(node);
          }
        }
      });
    })
  );
}

export async function hydrateCollections(renderers = {}) {
  const containers = Array.from(document.querySelectorAll('[data-collection]'));
  if (!containers.length) {
    return {};
  }
  const results = {};

  await Promise.all(
    containers.map(async container => {
      const key = container.dataset.collection;
      const path = container.dataset.collectionPath || key;
      const limitValue = container.dataset.limit ? Number(container.dataset.limit) : undefined;
      const orderByValue = parseOrderBy(container.dataset.orderBy);
      setLoadingHTML(container);

      const { data, error } = await useCollection(path, {
        orderBy: orderByValue,
        limit: limitValue,
      });

      if (error || !data.length || !renderers[key]) {
        restoreHTMLFallback(container);
        return;
      }

      const renderer = renderers[key];
      container.innerHTML = '';
      data.forEach((item, index) => {
        const node = renderer(item, { index });
        if (node) {
          container.appendChild(node);
        }
      });
      results[key] = data;
      document.dispatchEvent(
        new CustomEvent('collection:hydrated', {
          detail: { key, data, container },
        })
      );
    })
  );

  return results;
}
