export function initI18n() {
  document.title = chrome.i18n.getMessage("newTabTitle");

  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = chrome.i18n.getMessage(key);
  });

  const ariaLabelElements = document.querySelectorAll('[data-i18n-aria-label]');
  ariaLabelElements.forEach(element => {
    const key = element.getAttribute('data-i18n-aria-label');
    element.setAttribute('aria-label', chrome.i18n.getMessage(key));
  });

  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.setAttribute('placeholder', chrome.i18n.getMessage(key));
    });

  const titleElements = document.querySelectorAll('[data-i18n-title]');
  titleElements.forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    element.setAttribute('title', chrome.i18n.getMessage(key));
  });
}
