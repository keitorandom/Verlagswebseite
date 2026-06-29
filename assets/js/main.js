// Minimal JavaScript for navigation, footer year, and CMS-managed book rendering.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const navigation = document.querySelector('#site-navigation');
  const yearTargets = document.querySelectorAll('[data-current-year]');

  yearTargets.forEach((target) => {
    target.textContent = new Date().getFullYear().toString();
  });

  initializeBrandLogos();
  renderBookSections();

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

async function renderBookSections() {
  const targets = document.querySelectorAll('[data-books-target]');

  if (!targets.length) {
    return;
  }

  try {
    const response = await fetch('data/books.json', { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Buchdaten konnten nicht geladen werden: ${response.status}`);
    }

    const data = await response.json();
    const books = Array.isArray(data.books) ? data.books : [];
    const sortedBooks = [...books].sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));

    targets.forEach((target) => {
      const mode = target.dataset.booksTarget;
      const visibleBooks = mode === 'featured'
        ? sortedBooks.filter((book) => book.featured).slice(0, 3)
        : sortedBooks;

      target.innerHTML = '';
      target.classList.toggle('book-grid-count-1', visibleBooks.length === 1);
      target.classList.toggle('book-grid-count-2', visibleBooks.length === 2);

      if (!visibleBooks.length) {
        target.append(createMessage('Derzeit sind keine Bücher eingetragen.'));
        return;
      }

      visibleBooks.forEach((book) => {
        target.append(mode === 'featured' ? createFeaturedBookCard(book) : createFullBookCard(book));
      });

      if (window.location.hash && mode === 'all') {
        document.querySelector(window.location.hash)?.scrollIntoView();
      }
    });
  } catch (error) {
    console.error(error);
    targets.forEach((target) => {
      target.innerHTML = '';
      target.append(createMessage('Die Buchdaten konnten gerade nicht geladen werden.'));
    });
  }
}

function createFeaturedBookCard(book) {
  const article = createBaseBookCard(book);
  const body = article.querySelector('.book-card-body');
  body.append(
    createElement('p', { className: 'book-status' }, book.releaseInfo || book.status || ''),
    createElement('p', {}, book.shortDescription || ''),
    createActions(book)
  );
  return article;
}

function createFullBookCard(book) {
  const article = createBaseBookCard(book);
  article.id = getBookId(book);
  const body = article.querySelector('.book-card-body');
  body.append(
    createElement('p', { className: 'book-status' }, [book.status, book.releaseInfo].filter(Boolean).join(' · ')),
    createElement('p', {}, book.shortDescription || ''),
    createActions(book),
    createSampleDetails(book)
  );
  return article;
}

function createBaseBookCard(book) {
  const title = book.title || 'Unbenanntes Buch';
  const article = createElement('article', { className: 'book-card' });
  const cover = createElement('div', { className: 'book-cover' });
  cover.dataset.fallbackTitle = title;

  if (book.cover) {
    const image = createElement('img', {
      src: book.cover,
      alt: `Cover von ${title}`,
      loading: 'lazy'
    });
    image.addEventListener('error', () => {
      image.hidden = true;
      cover.classList.add('is-missing');
    });
    cover.append(image);
  } else {
    cover.classList.add('is-missing');
  }

  cover.append(createElement('span', { className: 'cover-fallback', ariaHidden: 'true' }, title));

  const body = createElement('div', { className: 'book-card-body' });
  body.append(
    createElement('h3', {}, title),
    createElement('p', { className: 'book-author' }, book.author || '')
  );

  article.append(cover, body);
  return article;
}

function createActions(book) {
  const actions = createElement('div', { className: 'book-actions' });
  if (book.buyLink) {
    actions.append(createElement('a', { className: 'button button-small button-primary', href: book.buyLink }, book.buttonText || 'Jetzt kaufen'));
  }
  actions.append(createElement('a', { className: 'text-link', href: `buecher.html#${getBookId(book)}` }, 'Mehr erfahren'));
  return actions;
}

function createSampleDetails(book) {
  const details = createElement('details', { className: 'book-sample' });
  details.append(
    createElement('summary', {}, 'Leseprobe'),
    createElement('div', { className: 'book-sample-text' }, book.sample || 'Eine Leseprobe wird ergänzt.')
  );
  return details;
}

function getBookId(book) {
  return book.id || slugify(book.title || 'buch');
}

function slugify(value) {
  return value.toString().toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function createMessage(text) {
  return createElement('p', { className: 'books-loading' }, text);
}

function createElement(tagName, options = {}, text = '') {
  const element = document.createElement(tagName);
  Object.entries(options).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'ariaHidden') {
      element.setAttribute('aria-hidden', value);
    } else {
      element.setAttribute(key, value);
    }
  });
  if (text) {
    element.textContent = text;
  }
  return element;
}

const MAX_MANUSCRIPT_SIZE = 8 * 1024 * 1024;
const ALLOWED_MANUSCRIPT_EXTENSIONS = ['pdf', 'doc', 'docx'];

function initializeManuscriptForm() {
  const form = document.querySelector('[data-manuscript-form]');
  if (!form) {
    return;
  }

  const fileInput = form.querySelector('[data-file-input]');
  const fileError = form.querySelector('[data-file-error]');
  const successMessage = document.querySelector('[data-success-message]');
  const params = new URLSearchParams(window.location.search);

  if (params.get('success') === 'true' && successMessage) {
    successMessage.hidden = false;
    successMessage.focus();
  }

  function validateFile() {
    if (!fileInput || !fileError) {
      return true;
    }

    const file = fileInput.files && fileInput.files[0];
    fileError.textContent = '';
    fileInput.setCustomValidity('');

    if (!file) {
      return true;
    }

    const extension = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_MANUSCRIPT_EXTENSIONS.includes(extension)) {
      const message = 'Bitte laden Sie eine Datei im Format PDF, DOC oder DOCX hoch.';
      fileError.textContent = message;
      fileInput.setCustomValidity(message);
      return false;
    }

    if (file.size > MAX_MANUSCRIPT_SIZE) {
      const message = 'Die Manuskript-Datei ist zu groß. Bitte laden Sie eine Datei mit maximal 8 MB hoch.';
      fileError.textContent = message;
      fileInput.setCustomValidity(message);
      return false;
    }

    return true;
  }

  fileInput?.addEventListener('change', validateFile);
  form.addEventListener('submit', (event) => {
    if (!validateFile() || !form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
    }
  });
}

document.addEventListener('DOMContentLoaded', initializeManuscriptForm);

function initializeBrandLogos() {
  document.querySelectorAll('.brand-logo').forEach((logo) => {
    logo.addEventListener('error', () => {
      logo.hidden = true;
    });
  });
}
