// Navigation
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const navigation = document.querySelector("#site-navigation");
  const yearTargets = document.querySelectorAll("[data-current-year]");

  yearTargets.forEach((target) => {
    target.textContent = new Date().getFullYear().toString();
  });

  initializeBrandLogos();
  renderBookSections();

  if (!toggle || !navigation) {
    return;
  }

  const label = toggle.querySelector(".sr-only");

  function setNavigationState(isOpen) {
    toggle.setAttribute("aria-expanded", String(isOpen));
    navigation.classList.toggle("is-open", isOpen);
    if (label) {
      label.textContent = isOpen ? "Navigation schließen" : "Navigation öffnen";
    }
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setNavigationState(!isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setNavigationState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavigationState(false);
      toggle.focus();
    }
  });
});

// Buchdaten laden
async function renderBookSections() {
  const targets = document.querySelectorAll("[data-books-target]");

  if (!targets.length) {
    return;
  }

  try {
    const response = await fetch("data/books.json", { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(
        `Buchdaten konnten nicht geladen werden: ${response.status}`,
      );
    }

    const data = await response.json();
    const books = Array.isArray(data.books) ? data.books : [];
    const sortedBooks = [...books].sort(
      (a, b) => Number(b.priority || 0) - Number(a.priority || 0),
    );

    targets.forEach((target) => {
      const mode = target.dataset.booksTarget;
      const visibleBooks =
        mode === "featured"
          ? sortedBooks.filter((book) => book.featured).slice(0, 3)
          : sortedBooks;

      target.innerHTML = "";
      target.classList.toggle("book-grid-count-1", visibleBooks.length === 1);
      target.classList.toggle("book-grid-count-2", visibleBooks.length === 2);

      if (!visibleBooks.length) {
        target.append(createMessage("Derzeit sind keine Bücher eingetragen."));
        return;
      }

      visibleBooks.forEach((book) => {
        target.append(
          mode === "featured"
            ? createFeaturedBookCard(book)
            : createFullBookCard(book),
        );
      });

      if (window.location.hash && mode === "all") {
        scrollToBookHash();
      }
    });
  } catch (error) {
    console.error(error);
    targets.forEach((target) => {
      target.innerHTML = "";
      target.append(
        createMessage("Die Buchdaten konnten gerade nicht geladen werden."),
      );
    });
  }
}

// Buchkarten rendern
function createFeaturedBookCard(book) {
  const article = createBaseBookCard(book);
  const body = article.querySelector(".book-card-body");
  body.append(
    createElement(
      "p",
      { className: "book-status" },
      book.releaseInfo || book.status || "",
    ),
    createElement("p", {}, book.shortDescription || ""),
    createActions(book),
  );
  return article;
}

function createFullBookCard(book) {
  const article = createBaseBookCard(book);
  article.id = getBookId(book);
  const body = article.querySelector(".book-card-body");
  body.append(
    createElement(
      "p",
      { className: "book-status" },
      [book.status, book.releaseInfo].filter(Boolean).join(" · "),
    ),
    createElement("p", {}, book.shortDescription || ""),
    createActions(book),
    createSampleDetails(book),
  );
  return article;
}

function createBaseBookCard(book) {
  const title = book.title || "Unbenanntes Buch";
  const article = createElement("article", { className: "book-card" });
  const cover = createElement("div", { className: "book-cover" });
  cover.dataset.fallbackTitle = title;

  if (book.cover) {
    const image = createElement("img", {
      src: book.cover,
      alt: `Cover von ${title}`,
      loading: "lazy",
    });
    image.addEventListener("error", () => {
      image.hidden = true;
      cover.classList.add("is-missing");
    });
    cover.append(image);
  } else {
    cover.classList.add("is-missing");
  }

  cover.append(
    createElement(
      "span",
      { className: "cover-fallback", ariaHidden: "true" },
      title,
    ),
  );

  const body = createElement("div", { className: "book-card-body" });
  body.append(
    createElement("h3", {}, title),
    createElement("p", { className: "book-author" }, book.author || ""),
  );

  article.append(cover, body);
  return article;
}

function createActions(book) {
  const actions = createElement("div", { className: "book-actions" });
  const buyLink = getSafeUrl(book.buyLink);

  if (buyLink) {
    actions.append(
      createElement(
        "a",
        { className: "button button-small button-primary", href: buyLink },
        book.buttonText || "Jetzt kaufen",
      ),
    );
  }

  actions.append(
    createElement(
      "a",
      {
        className: "text-link",
        href: `buecher.html#${encodeURIComponent(getBookId(book))}`,
      },
      "Mehr erfahren",
    ),
  );
  return actions;
}

// Leseproben rendern
function createSampleDetails(book) {
  const details = createElement("details", { className: "book-sample" });
  details.append(
    createElement("summary", {}, "Leseprobe"),
    createMarkdownSample(book.sample || "Eine Leseprobe wird ergänzt."),
  );
  return details;
}

function createMarkdownSample(markdown) {
  const container = createElement("div", { className: "book-sample-text" });
  const lines = String(markdown).replace(/\r\n?/g, "\n").split("\n");
  let index = 0;

  function appendInline(parent, text) {
    const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parent.append(
          document.createTextNode(text.slice(lastIndex, match.index)),
        );
      }

      const tagName = match[2] ? "strong" : "em";
      const element = document.createElement(tagName);
      element.textContent = match[2] || match[3] || "";
      parent.append(element);
      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
      parent.append(document.createTextNode(text.slice(lastIndex)));
    }
  }

  function appendParagraph(text) {
    const paragraph = document.createElement("p");
    appendInline(paragraph, text.trim());
    container.append(paragraph);
  }

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const headingElement = document.createElement(
        `h${heading[1].length + 3}`,
      );
      appendInline(headingElement, heading[2]);
      container.append(headingElement);
      index += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quote = document.createElement("blockquote");
      const quoteLines = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      appendInline(quote, quoteLines.join(" "));
      container.append(quote);
      continue;
    }

    const unordered = trimmed.match(/^-\s+(.+)$/);
    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      const list = document.createElement(unordered ? "ul" : "ol");
      const itemPattern = unordered ? /^-\s+(.+)$/ : /^\d+\.\s+(.+)$/;
      while (index < lines.length) {
        const itemMatch = lines[index].trim().match(itemPattern);
        if (!itemMatch) {
          break;
        }
        const item = document.createElement("li");
        appendInline(item, itemMatch[1]);
        list.append(item);
        index += 1;
      }
      container.append(list);
      continue;
    }

    const paragraphLines = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (
        !current ||
        /^(#{1,3})\s+/.test(current) ||
        current.startsWith(">") ||
        /^-\s+/.test(current) ||
        /^\d+\.\s+/.test(current)
      ) {
        break;
      }
      paragraphLines.push(current);
      index += 1;
    }
    appendParagraph(paragraphLines.join(" "));
  }

  return container;
}

// Hash-Navigation
function scrollToBookHash() {
  const rawHash = window.location.hash;

  if (!rawHash || rawHash === "#") {
    return;
  }

  let id = "";

  try {
    id = decodeURIComponent(rawHash.slice(1));
  } catch (error) {
    return;
  }

  if (!id) {
    return;
  }

  document.getElementById(id)?.scrollIntoView();
}

function getBookId(book) {
  return book.id || slugify(book.title || "buch");
}

function slugify(value) {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSafeUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(String(value), window.location.href);
    return ["http:", "https:", "mailto:"].includes(url.protocol)
      ? url.href
      : "";
  } catch (error) {
    return "";
  }
}

function createMessage(text) {
  return createElement("p", { className: "books-loading" }, text);
}

function createElement(tagName, options = {}, text = "") {
  const element = document.createElement(tagName);
  Object.entries(options).forEach(([key, value]) => {
    if (key === "className") {
      element.className = value;
    } else if (key === "ariaHidden") {
      element.setAttribute("aria-hidden", value);
    } else {
      element.setAttribute(key, value);
    }
  });
  if (text) {
    element.textContent = text;
  }
  return element;
}

// Sonstige Frontend-Logik
const MAX_MANUSCRIPT_SIZE = 4 * 1024 * 1024;
const ALLOWED_MANUSCRIPT_EXTENSIONS = ["pdf", "doc", "docx"];

function initializeManuscriptForm() {
  const form = document.querySelector("[data-manuscript-form]");
  if (!form) {
    return;
  }

  const fileInput = form.querySelector("[data-file-input]");
  const fileError = form.querySelector("[data-file-error]");
  const successMessage = document.querySelector("[data-success-message]");
  const params = new URLSearchParams(window.location.search);

  if (params.get("success") === "true" && successMessage) {
    successMessage.hidden = false;
    successMessage.focus();
  }

  function validateFile() {
    if (!fileInput || !fileError) {
      return true;
    }

    const file = fileInput.files && fileInput.files[0];
    fileError.textContent = "";
    fileInput.setCustomValidity("");

    if (!file) {
      return true;
    }

    const extension = file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_MANUSCRIPT_EXTENSIONS.includes(extension)) {
      const message =
        "Bitte laden Sie eine Datei im Format PDF, DOC oder DOCX hoch.";
      fileError.textContent = message;
      fileInput.setCustomValidity(message);
      return false;
    }

    if (file.size > MAX_MANUSCRIPT_SIZE) {
      const message =
        "Die Manuskript-Datei ist zu groß. Bitte laden Sie eine Datei mit maximal 4 MB hoch.";
      fileError.textContent = message;
      fileInput.setCustomValidity(message);
      return false;
    }

    return true;
  }

  const status = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector("[data-submit-button]");
  const endpoint = form.dataset.endpoint;

  function setStatus(message, type = "info") {
    if (!status) {
      return;
    }
    status.textContent = message;
    status.dataset.status = type;
  }

  fileInput?.addEventListener("change", validateFile);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateFile() || !form.checkValidity()) {
      form.reportValidity();
      setStatus("Bitte prüfen Sie die markierten Pflichtfelder.", "error");
      return;
    }

    if (!endpoint || !endpoint.startsWith("https://")) {
      setStatus(
        "Die Einreichung ist derzeit nicht korrekt konfiguriert. Bitte versuchen Sie es später erneut.",
        "error",
      );
      return;
    }

    submitButton.disabled = true;
    setStatus("Ihre Einreichung wird übermittelt …", "loading");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Die Einreichung konnte nicht übermittelt werden. Bitte versuchen Sie es später erneut.",
        );
      }

      form.reset();
      setStatus(
        "Vielen Dank. Ihre Einreichung wurde übermittelt. Wir prüfen Ihr Manuskript sorgfältig und melden uns bei Interesse.",
        "success",
      );
      successMessage?.removeAttribute("hidden");
      successMessage?.focus();
    } catch (error) {
      setStatus(
        error.message ||
          "Die Einreichung konnte nicht übermittelt werden. Bitte versuchen Sie es später erneut.",
        "error",
      );
    } finally {
      submitButton.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", initializeManuscriptForm);

function initializeBrandLogos() {
  document.querySelectorAll(".site-logo-image").forEach((logo) => {
    logo.addEventListener("error", () => {
      logo.hidden = true;
    });
  });
}
