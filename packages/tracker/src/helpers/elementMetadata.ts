export interface ElementMetadata {
  element_id: string;
  element_label: string;
  element_type: string;
}

function getElementPath(el: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = el;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.nodeName.toLowerCase();

    if (current.id) {
      path.unshift(`${selector}#${current.id}`);
      break; // IDが存在する場合は一意とみなしてトラバースを終了
    }

    let index = 1;
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (sibling.nodeName.toLowerCase() === selector) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }
    path.unshift(`${selector}:nth-of-type(${index})`);
    current = current.parentElement;
  }
  return path.join(' > ');
}

export function getElementMetadata(el: HTMLElement): ElementMetadata {
  return {
    element_id:
      el.getAttribute('data-lightscope-id') ||
      el.getAttribute('data-analytics-id') ||
      el.id ||
      getElementPath(el),
    element_label:
      el.getAttribute('data-lightscope-label') ||
      el.getAttribute('data-analytics-label') ||
      el.getAttribute('aria-label') ||
      el.textContent?.trim().slice(0, 100) ||
      '',
    element_type: el.getAttribute('data-lightscope-type') || el.tagName.toLowerCase(),
  };
}
