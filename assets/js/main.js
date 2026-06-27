// Minimal JavaScript for the mobile navigation and dynamic footer year.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const navigation = document.querySelector('#site-navigation');
  const yearTargets = document.querySelectorAll('[data-current-year]');

  yearTargets.forEach((target) => {
    target.textContent = new Date().getFullYear().toString();
  });

  if (!toggle || !navigation) {
    return;
  }

  const label = toggle.querySelector('.sr-only');

  function setNavigationState(isOpen) {
    toggle.setAttribute('aria-expanded', String(isOpen));
    navigation.classList.toggle('is-open', isOpen);
    if (label) {
      label.textContent = isOpen ? 'Navigation schließen' : 'Navigation öffnen';
    }
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setNavigationState(!isOpen);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setNavigationState(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setNavigationState(false);
      toggle.focus();
    }
  });
});
