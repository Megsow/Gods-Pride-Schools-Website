import {
  deleteDocument,
  saveDocument,
  subscribeToCollection,
  subscribeToDocument,
  signOutUser
} from "../../firebase/config.js";
import { getNestedValue } from "../../utils/object.js";
import { createRouter } from "../router.js";

const ANNOUNCEMENT_FIELDS = [
  { name: "title", label: "Title", required: true, placeholder: "Admissions now open" },
  {
    name: "summary",
    label: "Summary",
    type: "textarea",
    required: true,
    placeholder: "Short teaser shown above the Read More link."
  },
  {
    name: "body",
    label: "Body (HTML allowed)",
    type: "html",
    required: true,
    placeholder: "<p>Full announcement details...</p>",
    trim: false
  },
  { name: "image.url", label: "Image URL", type: "url", placeholder: "https://..." },
  { name: "image.alt", label: "Image alt text", placeholder: "Students celebrating" },
  {
    name: "publishedAt",
    label: "Published at",
    type: "datetime",
    required: true,
    helper: "Controls sorting; newest announcements appear first."
  },
  {
    name: "priority",
    label: "Priority",
    type: "number",
    helper: "Higher numbers appear before others when dates match."
  }
];

const TESTIMONIAL_FIELDS = [
  {
    name: "quote",
    label: "Quote",
    type: "textarea",
    required: true,
    placeholder: "\"Our children love...\"",
    trim: false
  },
  { name: "author", label: "Author", required: true, placeholder: "Mrs. Adeoye, Parent" },
  {
    name: "priority",
    label: "Priority",
    type: "number",
    helper: "Higher numbers appear first in the carousel."
  }
];

const NEWS_FIELDS = [
  { name: "title", label: "Title", required: true, placeholder: "STEM fair dazzles community" },
  {
    name: "summary",
    label: "Summary",
    type: "textarea",
    required: true,
    placeholder: "Short overview shown on the card."
  },
  {
    name: "body",
    label: "Body (HTML allowed)",
    type: "html",
    placeholder: "<p>Full article content...</p>",
    trim: false
  },
  { name: "link", label: "External link", type: "url", placeholder: "https://example.com/full-story" },
  { name: "image.url", label: "Image URL", type: "url", placeholder: "https://..." },
  { name: "image.alt", label: "Image alt text", placeholder: "Students receiving awards" },
  {
    name: "publishedAt",
    label: "Published at",
    type: "datetime",
    required: true,
    helper: "Controls ordering; newest items appear first."
  }
];

const CAROUSEL_FIELDS = [
  { name: "url", label: "Image URL", type: "url", required: true, placeholder: "https://..." },
  { name: "alt", label: "Alt text", required: true, placeholder: "Students celebrating" },
  { name: "caption", label: "Caption", placeholder: "Graduation day" },
  { name: "description", label: "Description", type: "textarea", placeholder: "Optional supporting text." },
  {
    name: "order",
    label: "Display order",
    type: "number",
    helper: "Lower numbers appear first in the carousel."
  }
];

const GALLERY_FIELDS = [
  { name: "url", label: "Image URL", type: "url", required: true, placeholder: "https://..." },
  { name: "alt", label: "Alt text", required: true, placeholder: "Students in robotics lab" },
  { name: "caption", label: "Caption", placeholder: "Robotics" },
  {
    name: "order",
    label: "Display order",
    type: "number",
    helper: "Lower numbers appear earlier in the gallery."
  }
];

const PARENTS_CARD_FIELDS = [
  { name: "title", label: "Title", required: true, placeholder: "Stay Connected" },
  {
    name: "items",
    label: "Bullet points",
    type: "list",
    required: true,
    helper: "Enter one item per line."
  },
  {
    name: "order",
    label: "Display order",
    type: "number",
    helper: "Lower numbers appear first."
  }
];

const SECTION_DEFINITIONS = [
  {
    id: "settings",
    label: "Site settings",
    create: (statusArea) => createSettingsSection(statusArea)
  },
  {
    id: "announcements",
    label: "Announcements",
    create: (statusArea) =>
      createCollectionSection({
        id: "announcements",
        title: "Latest announcements",
        description:
          "Publish and manage the announcement cards that appear on the home and news pages.",
        collectionPath: "announcements",
        orderBy: [["publishedAt", "desc"]],
        statusArea,
        formTitle: "Create or edit announcement",
        submitLabel: "Save announcement",
        updateLabel: "Update announcement",
        successMessage: "Announcement saved successfully.",
        deleteSuccessMessage: "Announcement deleted.",
        deleteConfirmation: "Delete this announcement?",
        emptyState: "No announcements have been published yet.",
        fields: ANNOUNCEMENT_FIELDS,
        listTitle: (item) => item.title || item.id,
        listSubtitle: (item) => item.summary,
        listMeta: (item) => formatDisplayDate(item.publishedAt)
      })
  },
  {
    id: "testimonials",
    label: "Testimonials",
    create: (statusArea) =>
      createCollectionSection({
        id: "testimonials",
        title: "Testimonials",
        description:
          "Update the quotes showcased in the \"What Our Students and Parents Say\" carousel.",
        collectionPath: "testimonials",
        orderBy: [["priority", "desc"]],
        statusArea,
        formTitle: "Create or edit testimonial",
        submitLabel: "Save testimonial",
        updateLabel: "Update testimonial",
        successMessage: "Testimonial saved.",
        deleteSuccessMessage: "Testimonial deleted.",
        deleteConfirmation: "Delete this testimonial?",
        emptyState: "No testimonials have been added yet.",
        fields: TESTIMONIAL_FIELDS,
        listTitle: (item) => item.author || "Testimonial",
        listSubtitle: (item) => item.quote
      })
  },
  {
    id: "parents",
    label: "Parents' Corner",
    create: (statusArea) => createParentsCornerSection(statusArea)
  },
  {
    id: "news",
    label: "News",
    create: (statusArea) =>
      createCollectionSection({
        id: "news",
        title: "News articles",
        description: "Manage news stories displayed on the News page under Latest News.",
        collectionPath: "news",
        orderBy: [["publishedAt", "desc"]],
        statusArea,
        formTitle: "Create or edit news story",
        submitLabel: "Save news story",
        updateLabel: "Update news story",
        successMessage: "News story saved.",
        deleteSuccessMessage: "News story deleted.",
        deleteConfirmation: "Delete this news story?",
        emptyState: "No news stories have been created yet.",
        fields: NEWS_FIELDS,
        listTitle: (item) => item.title || item.id,
        listSubtitle: (item) => item.summary,
        listMeta: (item) => formatDisplayDate(item.publishedAt)
      })
  },
  {
    id: "carousel",
    label: "Homepage carousel",
    create: (statusArea) =>
      createCollectionSection({
        id: "home-carousel",
        title: "Homepage carousel",
        description: "Set the images and captions that rotate in the homepage hero carousel.",
        collectionPath: "media/homeCarousel",
        orderBy: [["order", "asc"]],
        statusArea,
        formTitle: "Create or edit carousel slide",
        submitLabel: "Save slide",
        updateLabel: "Update slide",
        successMessage: "Carousel slide saved.",
        deleteSuccessMessage: "Carousel slide deleted.",
        deleteConfirmation: "Delete this carousel slide?",
        emptyState: "No carousel slides have been uploaded yet.",
        fields: CAROUSEL_FIELDS,
        listTitle: (item) => item.caption || item.alt || item.url,
        listSubtitle: (item) => item.description,
        listMeta: (item) => (item.order !== undefined && item.order !== null ? `Order ${item.order}` : "")
      })
  },
  {
    id: "gallery",
    label: "Gallery",
    create: (statusArea) =>
      createCollectionSection({
        id: "media-gallery",
        title: "Media gallery",
        description: "Manage the photos shown on the gallery and homepage media grids.",
        collectionPath: "media/gallery",
        orderBy: [["order", "asc"]],
        statusArea,
        formTitle: "Create or edit gallery image",
        submitLabel: "Save image",
        updateLabel: "Update image",
        successMessage: "Gallery image saved.",
        deleteSuccessMessage: "Gallery image deleted.",
        deleteConfirmation: "Delete this gallery image?",
        emptyState: "No gallery images have been added yet.",
        fields: GALLERY_FIELDS,
        listTitle: (item) => item.caption || item.alt || item.url,
        listSubtitle: (item) => item.url,
        listMeta: (item) => (item.order !== undefined && item.order !== null ? `Order ${item.order}` : "")
      })
  }
];
export function renderDashboardView(root, { user }) {
  root.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "admin-shell";

  const card = document.createElement("div");
  card.className = "admin-card";

  const header = document.createElement("header");
  header.className = "admin-header";

  const titleWrap = document.createElement("div");
  const title = document.createElement("h1");
  title.textContent = "Content dashboard";

  const welcome = document.createElement("p");
  welcome.className = "helper-text";
  welcome.textContent = user?.email
    ? `Signed in as ${user.email}`
    : "Signed in as administrator";

  titleWrap.append(title, welcome);

  const nav = document.createElement("div");
  nav.className = "admin-nav";

  const signOutButton = document.createElement("button");
  signOutButton.className = "secondary-btn";
  signOutButton.textContent = "Sign out";
  signOutButton.addEventListener("click", () => {
    signOutUser();
  });

  header.append(titleWrap, nav, signOutButton);

  const statusArea = document.createElement("div");
  statusArea.className = "helper-text";

  const content = document.createElement("div");
  content.className = "admin-content";

  card.append(header, statusArea, content);
  shell.append(card);
  root.append(shell);

  const sectionsConfig = SECTION_DEFINITIONS.map((definition) => ({
    id: definition.id,
    label: definition.label,
    factory: () => definition.create(statusArea)
  }));

  const buttons = new Map();
  const sections = new Map();

  const router = createRouter({
    defaultRoute: sectionsConfig[0]?.id || "settings",
    onRouteChange: (route) => {
      setActiveRoute(route || sectionsConfig[0]?.id || "settings");
    }
  });

  sectionsConfig.forEach((config) => {
    const button = createTabButton(config.label, config.id);
    buttons.set(config.id, button);
    nav.appendChild(button);

    const instance = config.factory();
    instance.section.style.display = "none";
    sections.set(config.id, instance);
    content.appendChild(instance.section);

    button.addEventListener("click", () => {
      router.navigate(config.id);
    });
  });

  function setActiveRoute(route) {
    sections.forEach((instance, id) => {
      const isActive = id === route;
      instance.section.style.display = isActive ? "block" : "none";
      const button = buttons.get(id);
      if (button) {
        button.classList.toggle("active", isActive);
      }
      if (isActive) {
        instance.activate?.();
      } else {
        instance.deactivate?.();
      }
    });
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.removedNodes.length > 0) {
        cleanup();
      }
    });
  });

  observer.observe(root, { childList: true });

  function cleanup() {
    observer.disconnect();
    router.teardown();
    sections.forEach((instance) => {
      instance.cleanup?.();
    });
  }

  return cleanup;
}
function createSettingsSection(statusArea) {
  const container = document.createElement("div");
  container.className = "section-stack";
  container.id = "settings-section";

  const globalCard = document.createElement("section");
  globalCard.className = "section-card";
  const globalHeading = document.createElement("h2");
  globalHeading.textContent = "Global branding";
  const globalDescription = document.createElement("p");
  globalDescription.className = "helper-text";
  globalDescription.textContent =
    "Update the school name, logos, contact information, and footer details shown across every page.";

  const globalForm = createDocumentForm({
    statusArea,
    collection: "settings",
    docId: "global",
    formTitle: "Save global settings",
    successMessage: "Global settings saved.",
    fields: [
      { name: "siteName", label: "Site name", required: true, placeholder: "GOD'S PRIDE GROUP OF SCHOOLS" },
      {
        name: "tagline",
        label: "Tagline",
        required: true,
        placeholder: "Building Spiritual, Moral and Academic Excellence on a Firm Foundation"
      },
      { name: "logos.left.url", label: "Left logo URL", type: "url", placeholder: "https://..." },
      { name: "logos.right.url", label: "Right logo URL", type: "url", placeholder: "https://..." },
      { name: "contact.email", label: "Contact email", type: "email", placeholder: "info@example.com" },
      { name: "contact.phone", label: "Contact phone", placeholder: "+234-..." },
      { name: "address", label: "Address", type: "textarea", required: true, placeholder: "Street, City, State." },
      { name: "social.facebook", label: "Facebook URL", type: "url", placeholder: "https://facebook.com/..." },
      { name: "social.instagram", label: "Instagram URL", type: "url", placeholder: "https://instagram.com/..." },
      { name: "footer.copyright", label: "Footer copyright", placeholder: "© 2025 God's Pride Schools" }
    ]
  });

  globalCard.append(globalHeading, globalDescription, globalForm.formElement);
  container.appendChild(globalCard);

  const homepageCard = document.createElement("section");
  homepageCard.className = "section-card";
  const homepageHeading = document.createElement("h2");
  homepageHeading.textContent = "Homepage headings";
  const homepageDescription = document.createElement("p");
  homepageDescription.className = "helper-text";
  homepageDescription.textContent =
    "Control the hero text, marquee, and section headings used on the homepage.";

  const homepageForm = createDocumentForm({
    statusArea,
    collection: "settings",
    docId: "homepage",
    formTitle: "Save homepage headings",
    successMessage: "Homepage headings saved.",
    fields: [
      { name: "intro.title", label: "Intro title", required: true, placeholder: "God's Pride Group of Schools" },
      { name: "intro.marquee", label: "Scrolling marquee", required: true, placeholder: "The Home Of Godly Global Champions" },
      { name: "announcements.heading", label: "Announcements heading", required: true, placeholder: "Latest Announcements" },
      {
        name: "testimonials.heading",
        label: "Testimonials heading",
        required: true,
        placeholder: "What Our Students and Parents Say"
      }
    ]
  });

  homepageCard.append(homepageHeading, homepageDescription, homepageForm.formElement);
  container.appendChild(homepageCard);

  return {
    section: container,
    activate() {
      globalForm.activate();
      homepageForm.activate();
    },
    deactivate() {},
    cleanup() {
      globalForm.cleanup?.();
      homepageForm.cleanup?.();
    }
  };
}

function createParentsCornerSection(statusArea) {
  const container = document.createElement("div");
  container.className = "section-stack";
  container.id = "parents-section";

  const copyCard = document.createElement("section");
  copyCard.className = "section-card";
  const copyHeading = document.createElement("h2");
  copyHeading.textContent = "Parents' Corner copy";
  const copyDescription = document.createElement("p");
  copyDescription.className = "helper-text";
  copyDescription.textContent =
    "Edit the heading and introduction paragraph that appear above the Parents' Corner grid.";

  const copyForm = createDocumentForm({
    statusArea,
    collection: "content",
    docId: "parentsCorner",
    formTitle: "Save Parents' Corner copy",
    successMessage: "Parents' Corner introduction saved.",
    fields: [
      { name: "heading", label: "Section heading", required: true, placeholder: "Parents' Corner" },
      {
        name: "intro",
        label: "Introductory text",
        type: "textarea",
        required: true,
        placeholder: "We deeply value our parents..."
      }
    ]
  });

  copyCard.append(copyHeading, copyDescription, copyForm.formElement);
  container.appendChild(copyCard);

  const cardsSection = createCollectionSection({
    id: "parents-corner-cards",
    title: "Parents' Corner cards",
    description: "Manage the supportive cards displayed in the Parents' Corner grid on the homepage.",
    collectionPath: "content/parentsCorner/cards",
    orderBy: [["order", "asc"]],
    statusArea,
    formTitle: "Create or edit card",
    submitLabel: "Save card",
    updateLabel: "Update card",
    successMessage: "Parents' Corner card saved.",
    deleteSuccessMessage: "Parents' Corner card deleted.",
    deleteConfirmation: "Delete this Parents' Corner card?",
    emptyState: "No Parents' Corner cards have been created yet.",
    fields: PARENTS_CARD_FIELDS,
    listTitle: (item) => item.title || item.id,
    listSubtitle: (item) => (Array.isArray(item.items) ? item.items.join(" • ") : ""),
    listMeta: (item) => (item.order !== undefined && item.order !== null ? `Order ${item.order}` : "")
  });

  container.appendChild(cardsSection.section);

  return {
    section: container,
    activate() {
      copyForm.activate();
      cardsSection.activate?.();
    },
    deactivate() {
      cardsSection.deactivate?.();
    },
    cleanup() {
      copyForm.cleanup?.();
      cardsSection.cleanup?.();
    }
  };
}
function createCollectionSection({
  id,
  title,
  description,
  collectionPath,
  orderBy,
  statusArea,
  formTitle,
  submitLabel = "Save",
  updateLabel = "Update",
  successMessage = "Saved successfully.",
  deleteSuccessMessage = "Entry deleted.",
  deleteConfirmation = "Delete this entry?",
  emptyState = "No content found yet.",
  fields,
  listTitle,
  listSubtitle,
  listMeta
}) {
  const section = document.createElement("section");
  section.className = "section-card";
  section.id = `${id}-section`;

  const heading = document.createElement("h2");
  heading.textContent = title;
  const helper = document.createElement("p");
  helper.className = "helper-text";
  helper.textContent = description;

  const list = document.createElement("div");
  list.className = "list";

  const formElement = document.createElement("form");
  formElement.dataset.mode = "create";

  const formHeading = document.createElement("h3");
  formHeading.textContent = formTitle;

  const controls = createFieldControls(fields || []);

  const buttonRow = document.createElement("div");
  buttonRow.className = "list-item-actions";
  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "secondary-btn";
  resetButton.textContent = "Reset";
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "primary-btn";
  submitButton.textContent = submitLabel;
  buttonRow.append(resetButton, submitButton);

  const message = document.createElement("div");
  message.className = "helper-text";

  formElement.append(formHeading);
  controls.forEach((control) => {
    formElement.appendChild(control.field);
  });
  formElement.append(buttonRow, message);

  section.append(heading, helper, list, formElement);

  let currentId = null;
  let unsubscribe = null;
  let isSubmitting = false;

  renderList([]);

  formElement.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const { values, errors } = collectFieldValues(controls);
    if (errors.length) {
      message.textContent = errors.join(" ");
      message.className = "error-banner";
      return;
    }

    const payload = { ...values };
    if (currentId) {
      payload.id = currentId;
    }

    isSubmitting = true;
    setFormLoading(true);

    try {
      await saveDocument(collectionPath, payload);
      message.textContent = successMessage;
      message.className = "success-banner";
      setBanner(statusArea, successMessage, "success");
      if (!currentId) {
        resetForm();
      }
      currentId = null;
      formElement.dataset.mode = "create";
      submitButton.textContent = submitLabel;
    } catch (error) {
      console.error(error);
      const errorMessage = error?.message || "Unable to save changes.";
      message.textContent = errorMessage;
      message.className = "error-banner";
      setBanner(statusArea, errorMessage, "error");
    } finally {
      isSubmitting = false;
      setFormLoading(false);
    }
  });

  resetButton.addEventListener("click", () => {
    currentId = null;
    formElement.dataset.mode = "create";
    submitButton.textContent = submitLabel;
    message.textContent = "";
    message.className = "helper-text";
    resetForm();
  });

  function resetForm() {
    controls.forEach((control) => {
      control.clearError();
      control.setValue(control.config.type === "list" ? [] : "");
    });
  }

  function setFormLoading(value) {
    submitButton.disabled = value;
    resetButton.disabled = value;
    controls.forEach((control) => {
      control.input.disabled = value;
    });
    if (value) {
      submitButton.dataset.originalLabel = submitButton.textContent;
      submitButton.textContent = "Saving...";
    } else if (submitButton.dataset.originalLabel) {
      submitButton.textContent = submitButton.dataset.originalLabel;
      delete submitButton.dataset.originalLabel;
    }
  }

  function renderList(items) {
    list.innerHTML = "";
    if (!items || !items.length) {
      const empty = document.createElement("p");
      empty.className = "helper-text";
      empty.textContent = emptyState;
      list.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      list.appendChild(createListItem(item));
    });
  }

  function createListItem(item) {
    const entry = document.createElement("div");
    entry.className = "list-item";

    const titleText = listTitle ? listTitle(item) : item.title || item.caption || item.name || item.id;
    if (titleText) {
      const titleEl = document.createElement("strong");
      titleEl.textContent = titleText;
      entry.appendChild(titleEl);
    }

    const subtitleText = listSubtitle ? listSubtitle(item) : item.summary || item.description || item.quote;
    if (subtitleText) {
      const subtitleEl = document.createElement("p");
      subtitleEl.textContent = subtitleText;
      entry.appendChild(subtitleEl);
    }

    const metaText = listMeta ? listMeta(item) : "";
    if (metaText) {
      const metaEl = document.createElement("p");
      metaEl.className = "helper-text";
      metaEl.textContent = metaText;
      entry.appendChild(metaEl);
    }

    const actions = document.createElement("div");
    actions.className = "list-item-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "secondary-btn";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      currentId = item.id;
      formElement.dataset.mode = "edit";
      submitButton.textContent = updateLabel;
      controls.forEach((control) => {
        const value = getNestedValue(item, control.config.name);
        if (control.config.type === "list") {
          control.setValue(Array.isArray(value) ? value : []);
        } else {
          control.setValue(value ?? "");
        }
        control.clearError();
      });
      message.textContent = "Editing existing entry.";
      message.className = "helper-text";
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "secondary-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async () => {
      if (!confirm(deleteConfirmation)) {
        return;
      }
      try {
        await deleteDocument(collectionPath, item.id);
        setBanner(statusArea, deleteSuccessMessage, "success");
      } catch (error) {
        console.error(error);
        const errorMessage = error?.message || "Unable to delete entry.";
        setBanner(statusArea, errorMessage, "error");
      }
    });

    actions.append(editButton, deleteButton);
    entry.appendChild(actions);
    return entry;
  }

  function ensureSubscribed() {
    if (unsubscribe) {
      return;
    }
    unsubscribe = subscribeToCollection(
      collectionPath,
      (items) => {
        renderList(items);
      },
      { orderBy }
    );
  }

  return {
    section,
    activate() {
      ensureSubscribed();
    },
    deactivate() {},
    cleanup() {
      unsubscribe?.();
    }
  };
}

function createDocumentForm({
  statusArea,
  collection,
  docId,
  formTitle,
  fields,
  submitLabel = "Save",
  successMessage = "Saved successfully."
}) {
  const formElement = document.createElement("form");
  formElement.className = "document-form";

  const heading = document.createElement("h3");
  heading.textContent = formTitle;

  const controls = createFieldControls(fields || []);

  const buttonRow = document.createElement("div");
  buttonRow.className = "list-item-actions";
  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "secondary-btn";
  resetButton.textContent = "Reset";
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "primary-btn";
  submitButton.textContent = submitLabel;
  buttonRow.append(resetButton, submitButton);

  const message = document.createElement("div");
  message.className = "helper-text";

  formElement.append(heading);
  controls.forEach((control) => {
    formElement.appendChild(control.field);
  });
  formElement.append(buttonRow, message);

  let unsubscribe = null;
  let isSubmitting = false;
  let latestData = {};

  formElement.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const { values, errors } = collectFieldValues(controls);
    if (errors.length) {
      message.textContent = errors.join(" ");
      message.className = "error-banner";
      return;
    }

    isSubmitting = true;
    setLoading(true);

    try {
      await saveDocument(collection, { id: docId, ...values });
      message.textContent = successMessage;
      message.className = "success-banner";
      setBanner(statusArea, successMessage, "success");
    } catch (error) {
      console.error(error);
      const errorMessage = error?.message || "Unable to save changes.";
      message.textContent = errorMessage;
      message.className = "error-banner";
      setBanner(statusArea, errorMessage, "error");
    } finally {
      isSubmitting = false;
      setLoading(false);
    }
  });

  resetButton.addEventListener("click", () => {
    applyData(latestData);
    message.textContent = "";
    message.className = "helper-text";
  });

  function applyData(data) {
    latestData = data || {};
    controls.forEach((control) => {
      const value = getNestedValue(latestData, control.config.name);
      if (control.config.type === "list") {
        control.setValue(Array.isArray(value) ? value : []);
      } else {
        control.setValue(value ?? "");
      }
      control.clearError();
    });
  }

  function ensureSubscribed() {
    if (unsubscribe) {
      return;
    }
    unsubscribe = subscribeToDocument(`${collection}/${docId}`, (data) => {
      applyData(data || {});
    });
  }

  function setLoading(value) {
    submitButton.disabled = value;
    resetButton.disabled = value;
    controls.forEach((control) => {
      control.input.disabled = value;
    });
    if (value) {
      submitButton.dataset.originalLabel = submitButton.textContent;
      submitButton.textContent = "Saving...";
    } else if (submitButton.dataset.originalLabel) {
      submitButton.textContent = submitButton.dataset.originalLabel;
      delete submitButton.dataset.originalLabel;
    }
  }

  return {
    formElement,
    activate() {
      ensureSubscribed();
    },
    cleanup() {
      unsubscribe?.();
    }
  };
}

function createFieldControls(fieldConfigs) {
  return fieldConfigs.map((config) => createFieldControl(config));
}

function createFieldControl(config) {
  const field = document.createElement("div");
  field.className = "field";

  const label = document.createElement("label");
  const fieldId = config.id || `field-${config.name.replace(/[^a-z0-9]/gi, "-")}-${Math.random().toString(36).slice(2, 7)}`;
  label.setAttribute("for", fieldId);
  label.textContent = config.label || config.name;
  field.appendChild(label);

  let input;
  const type = config.type || "text";
  if (type === "textarea" || type === "html" || type === "list") {
    input = document.createElement("textarea");
    if (config.rows) {
      input.rows = config.rows;
    }
  } else {
    input = document.createElement("input");
    if (type === "number") {
      input.type = "number";
    } else if (type === "datetime") {
      input.type = "datetime-local";
    } else if (type === "email") {
      input.type = "email";
    } else if (type === "url") {
      input.type = "url";
    } else {
      input.type = "text";
    }
    if (config.step !== undefined) {
      input.step = String(config.step);
    }
    if (config.min !== undefined) {
      input.min = String(config.min);
    }
    if (config.max !== undefined) {
      input.max = String(config.max);
    }
  }

  input.id = fieldId;
  if (config.placeholder) {
    input.placeholder = config.placeholder;
  }
  if (config.autocomplete) {
    input.autocomplete = config.autocomplete;
  }
  field.appendChild(input);

  if (config.helper) {
    const helper = document.createElement("p");
    helper.className = "helper-text";
    helper.textContent = config.helper;
    field.appendChild(helper);
  }

  const error = document.createElement("div");
  error.className = "validation-error";
  field.appendChild(error);

  function setError(message) {
    error.textContent = message || "";
  }

  function clearError() {
    error.textContent = "";
  }

  function setValue(value) {
    if (type === "list") {
      input.value = Array.isArray(value) ? value.join("\n") : value || "";
      return;
    }
    if (type === "datetime") {
      input.value = value ? formatDateForInput(value) : "";
      return;
    }
    if (type === "number") {
      input.value = value === null || value === undefined ? "" : String(value);
      return;
    }
    input.value = value === null || value === undefined ? "" : String(value);
  }

  return {
    field,
    input,
    config,
    setError,
    clearError,
    setValue
  };
}

function collectFieldValues(controls) {
  const values = {};
  const errors = [];

  controls.forEach((control) => {
    control.clearError();
    const { value, error } = parseControlValue(control);
    if (error) {
      control.setError(error);
      errors.push(error);
      return;
    }
    if (control.config.required && isValueEmpty(value, control.config.type)) {
      const message = control.config.requiredMessage || "This field is required.";
      control.setError(message);
      errors.push(message);
      return;
    }
    setNestedValue(values, control.config.name, value);
  });

  return { values, errors };
}

function parseControlValue(control) {
  const type = control.config.type || "text";
  const rawValue = control.input.value;
  const shouldTrim = control.config.trim !== false && !["html", "textarea", "list"].includes(type);
  const value = shouldTrim && typeof rawValue === "string" ? rawValue.trim() : rawValue;

  try {
    if (type === "number") {
      if (value === "" || value === null) {
        return { value: null };
      }
      const parsed = Number(value);
      if (Number.isNaN(parsed)) {
        throw new Error("Enter a valid number.");
      }
      return { value: parsed };
    }
    if (type === "datetime") {
      if (!value) {
        return { value: null };
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        throw new Error("Enter a valid date and time.");
      }
      return { value: date };
    }
    if (type === "list") {
      if (!rawValue) {
        return { value: [] };
      }
      return {
        value: rawValue
          .split("\n")
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      };
    }
    return { value };
  } catch (error) {
    return { value: null, error: error?.message || "Invalid value." };
  }
}

function setNestedValue(target, path, value) {
  if (!path) {
    return;
  }
  const segments = path.split(".").map((segment) => segment.trim()).filter(Boolean);
  if (!segments.length) {
    return;
  }
  let current = target;
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = value;
    } else {
      if (!current[segment] || typeof current[segment] !== "object") {
        current[segment] = {};
      }
      current = current[segment];
    }
  });
}

function isValueEmpty(value, type) {
  if (type === "list") {
    return !value || value.length === 0;
  }
  if (type === "number") {
    return value === null || value === undefined || Number.isNaN(value);
  }
  if (type === "datetime") {
    return !value;
  }
  return value === "" || value === null || value === undefined;
}

function formatDisplayDate(value) {
  const date = toDate(value);
  if (!date) {
    return "";
  }
  return date.toLocaleDateString();
}

function toDate(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      return value.toDate();
    }
    if (typeof value.seconds === "number") {
      const milliseconds = value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1e6);
      const date = new Date(milliseconds);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }
  return null;
}

function formatDateForInput(value) {
  const date = toDate(value);
  if (!date) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function setBanner(target, message, variant = "info") {
  if (!target) {
    return;
  }
  if (!message) {
    target.textContent = "";
    target.className = "helper-text";
    return;
  }
  target.textContent = message;
  if (variant === "success") {
    target.className = "success-banner";
  } else if (variant === "error") {
    target.className = "error-banner";
  } else {
    target.className = "helper-text";
  }
}

function createTabButton(label, route) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.route = route;
  button.textContent = label;
  return button;
}
