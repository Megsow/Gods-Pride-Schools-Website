import {
  deleteDocument,
  saveDocument,
  subscribeToCollection,
  signOutUser
} from "../../firebase/config.js";

import { createRouter } from "../router.js";

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

  const copyTab = createTabButton("Site copy", "copy");
  const mediaTab = createTabButton("Images", "images");

  nav.append(copyTab, mediaTab);

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

  const copySection = createCopySection(statusArea);
  const imageSection = createImageSection(statusArea);

  content.append(copySection.section, imageSection.section);

  card.append(header, statusArea, content);
  shell.append(card);
  root.append(shell);

  const router = createRouter({
    onRouteChange: (route) => {
      setActiveRoute(route);
    }
  });

  let copyUnsubscribe = null;
  let imageUnsubscribe = null;

  function setActiveRoute(route) {
    if (route === "images") {
      copySection.section.style.display = "none";
      imageSection.section.style.display = "block";
      copyTab.classList.remove("active");
      mediaTab.classList.add("active");
      if (!imageUnsubscribe) {
        imageUnsubscribe = subscribeToCollection("imageMetadata", (items) => {
          imageSection.renderList(items);
        });
      }
    } else {
      copySection.section.style.display = "block";
      imageSection.section.style.display = "none";
      copyTab.classList.add("active");
      mediaTab.classList.remove("active");
      if (!copyUnsubscribe) {
        copyUnsubscribe = subscribeToCollection("siteCopy", (items) => {
          copySection.renderList(items);
        });
      }
    }
  }

  copyTab.addEventListener("click", () => router.navigate("copy"));
  mediaTab.addEventListener("click", () => router.navigate("images"));

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
    copyUnsubscribe?.();
    imageUnsubscribe?.();
  }

  return cleanup;
}

function createTabButton(label, route) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.route = route;
  button.textContent = label;
  return button;
}

function createCopySection(statusArea) {
  const section = document.createElement("section");
  section.className = "section-card";
  section.id = "copy-section";

  const heading = document.createElement("h2");
  heading.textContent = "Site copy";

  const description = document.createElement("p");
  description.className = "helper-text";
  description.textContent =
    "Manage hero text, announcements, and other copy blocks that power the public site.";

  const list = document.createElement("div");
  list.className = "list";

  const form = createCopyForm({
    onSubmit: async (payload) => {
      try {
        await saveDocument("siteCopy", payload);
        showSuccess("Copy saved successfully.");
        form.reset();
      } catch (error) {
        console.error(error);
        showError(parseError(error));
      }
    }
  });

  section.append(heading, description, list, form.formElement);

  function showSuccess(message) {
    statusArea.textContent = message;
    statusArea.className = "success-banner";
  }

  function showError(message) {
    statusArea.textContent = message;
    statusArea.className = "error-banner";
  }

  return {
    section,
    renderList(items) {
      list.innerHTML = "";
      if (!items.length) {
        const empty = document.createElement("p");
        empty.className = "helper-text";
        empty.textContent = "No copy has been created yet.";
        list.append(empty);
        return;
      }

      items.forEach((item) => {
        const entry = document.createElement("div");
        entry.className = "list-item";

        const title = document.createElement("strong");
        title.textContent = item.title || item.id;

        const summary = document.createElement("p");
        summary.textContent = item.content || "(No content yet)";

        const actions = document.createElement("div");
        actions.className = "list-item-actions";

        const editButton = document.createElement("button");
        editButton.className = "secondary-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
          form.fill(item);
          window.location.hash = "copy";
          window.scrollTo({ top: form.formElement.offsetTop - 60, behavior: "smooth" });
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "secondary-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
          if (!confirm("Delete this copy block?")) {
            return;
          }
          try {
            await deleteDocument("siteCopy", item.id);
            showSuccess("Copy deleted.");
          } catch (error) {
            console.error(error);
            showError(parseError(error));
          }
        });

        actions.append(editButton, deleteButton);

        entry.append(title, summary, actions);
        list.append(entry);
      });
    }
  };
}

function createImageSection(statusArea) {
  const section = document.createElement("section");
  section.className = "section-card";
  section.id = "images-section";
  section.style.display = "none";

  const heading = document.createElement("h2");
  heading.textContent = "Image metadata";

  const description = document.createElement("p");
  description.className = "helper-text";
  description.textContent =
    "Track image titles, descriptions, and alt text so the marketing team can keep the gallery fresh.";

  const list = document.createElement("div");
  list.className = "list";

  const form = createImageForm({
    onSubmit: async (payload) => {
      try {
        await saveDocument("imageMetadata", payload);
        showSuccess("Image metadata saved.");
        form.reset();
      } catch (error) {
        console.error(error);
        showError(parseError(error));
      }
    }
  });

  section.append(heading, description, list, form.formElement);

  function showSuccess(message) {
    statusArea.textContent = message;
    statusArea.className = "success-banner";
  }

  function showError(message) {
    statusArea.textContent = message;
    statusArea.className = "error-banner";
  }

  return {
    section,
    renderList(items) {
      list.innerHTML = "";
      if (!items.length) {
        const empty = document.createElement("p");
        empty.className = "helper-text";
        empty.textContent = "No images found yet.";
        list.append(empty);
        return;
      }

      items.forEach((item) => {
        const entry = document.createElement("div");
        entry.className = "list-item";

        const title = document.createElement("strong");
        title.textContent = item.title || item.id;

        const url = document.createElement("p");
        url.textContent = item.url || "(No URL provided)";
        url.className = "helper-text";

        const description = document.createElement("p");
        description.textContent = item.description || "";

        const altText = document.createElement("p");
        altText.className = "helper-text";
        altText.textContent = item.altText ? `Alt text: ${item.altText}` : "";

        const actions = document.createElement("div");
        actions.className = "list-item-actions";

        const editButton = document.createElement("button");
        editButton.className = "secondary-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
          form.fill(item);
          window.location.hash = "images";
          window.scrollTo({ top: form.formElement.offsetTop - 60, behavior: "smooth" });
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "secondary-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
          if (!confirm("Delete this image entry?")) {
            return;
          }
          try {
            await deleteDocument("imageMetadata", item.id);
            showSuccess("Image entry deleted.");
          } catch (error) {
            console.error(error);
            showError(parseError(error));
          }
        });

        actions.append(editButton, deleteButton);

        entry.append(title, url, description, altText, actions);
        list.append(entry);
      });
    }
  };
}

function createCopyForm({ onSubmit }) {
  const formElement = document.createElement("form");
  formElement.dataset.mode = "create";

  const heading = document.createElement("h3");
  heading.textContent = "Create or edit copy";

  const helper = document.createElement("p");
  helper.className = "helper-text";
  helper.textContent =
    "Give the copy block a descriptive title so you can reuse it around the site.";

  const idField = createTextInput({
    id: "copy-id",
    label: "Document ID",
    placeholder: "Generated automatically for new copy",
    disabled: true
  });

  const titleField = createTextInput({
    id: "copy-title",
    label: "Title",
    required: true,
    placeholder: "Admissions hero, newsletter banner, etc."
  });

  const contentField = createTextarea({
    id: "copy-content",
    label: "Content",
    required: true,
    placeholder: "Enter the text that should appear on the public site"
  });

  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "secondary-btn";
  resetButton.textContent = "Reset";

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "primary-btn";
  submitButton.textContent = "Save copy";

  const message = document.createElement("div");
  message.className = "helper-text";

  const buttonGroup = document.createElement("div");
  buttonGroup.className = "list-item-actions";
  buttonGroup.append(resetButton, submitButton);

  formElement.append(heading, helper, idField.field, titleField.field, contentField.field, buttonGroup, message);

  let currentId = null;

  formElement.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = titleField.input.value.trim();
    const content = contentField.textarea.value.trim();

    if (!title) {
      titleField.setError("Title is required.");
      return;
    }
    if (!content) {
      contentField.setError("Content cannot be empty.");
      return;
    }

    clearErrors();
    setLoading(true);

    try {
      await onSubmit({ id: currentId, title, content });
      message.textContent = "Copy saved.";
      message.className = "success-banner";
      if (!currentId) {
        formElement.reset();
      }
      currentId = null;
      idField.input.value = "";
      formElement.dataset.mode = "create";
      submitButton.textContent = "Save copy";
    } catch (error) {
      console.error(error);
      message.textContent = parseError(error);
      message.className = "error-banner";
    } finally {
      setLoading(false);
    }
  });

  resetButton.addEventListener("click", () => {
    currentId = null;
    formElement.reset();
    idField.input.value = "";
    formElement.dataset.mode = "create";
    submitButton.textContent = "Save copy";
    clearErrors();
    message.textContent = "";
    message.className = "helper-text";
  });

  function clearErrors() {
    titleField.clearError();
    contentField.clearError();
  }

  function setLoading(value) {
    submitButton.disabled = value;
    resetButton.disabled = value;
    submitButton.textContent = value ? "Saving..." : formElement.dataset.mode === "edit" ? "Update copy" : "Save copy";
  }

  return {
    formElement,
    fill(item) {
      currentId = item.id;
      formElement.dataset.mode = "edit";
      idField.input.value = item.id;
      titleField.input.value = item.title || "";
      contentField.textarea.value = item.content || "";
      submitButton.textContent = "Update copy";
      message.textContent = "Editing existing copy.";
      message.className = "helper-text";
      clearErrors();
    },
    reset() {
      currentId = null;
      formElement.reset();
      idField.input.value = "";
      formElement.dataset.mode = "create";
      submitButton.textContent = "Save copy";
    }
  };
}

function createImageForm({ onSubmit }) {
  const formElement = document.createElement("form");
  formElement.dataset.mode = "create";

  const heading = document.createElement("h3");
  heading.textContent = "Create or edit image metadata";

  const helper = document.createElement("p");
  helper.className = "helper-text";
  helper.textContent = "Store alt text and descriptions to keep the site accessible.";

  const idField = createTextInput({
    id: "image-id",
    label: "Document ID",
    placeholder: "Generated automatically for new entries",
    disabled: true
  });

  const titleField = createTextInput({
    id: "image-title",
    label: "Title",
    required: true,
    placeholder: "Graduation day hero image"
  });

  const urlField = createTextInput({
    id: "image-url",
    label: "Image URL",
    required: true,
    placeholder: "https://..."
  });

  const altField = createTextInput({
    id: "image-alt",
    label: "Alt text",
    required: true,
    placeholder: "Students celebrating on stage"
  });

  const descriptionField = createTextarea({
    id: "image-description",
    label: "Description",
    placeholder: "Optional context for editors"
  });

  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "secondary-btn";
  resetButton.textContent = "Reset";

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "primary-btn";
  submitButton.textContent = "Save image";

  const message = document.createElement("div");
  message.className = "helper-text";

  const buttonGroup = document.createElement("div");
  buttonGroup.className = "list-item-actions";
  buttonGroup.append(resetButton, submitButton);

  formElement.append(
    heading,
    helper,
    idField.field,
    titleField.field,
    urlField.field,
    altField.field,
    descriptionField.field,
    buttonGroup,
    message
  );

  let currentId = null;

  formElement.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = titleField.input.value.trim();
    const url = urlField.input.value.trim();
    const altText = altField.input.value.trim();
    const description = descriptionField.textarea.value.trim();

    clearErrors();

    const errors = [];
    if (!title) {
      errors.push("Title is required.");
      titleField.setError("Please add a title.");
    }
    if (!url) {
      errors.push("Image URL is required.");
      urlField.setError("Please add a URL.");
    } else if (!/^https?:\/\//i.test(url)) {
      errors.push("Enter a valid URL starting with http or https.");
      urlField.setError("Enter a valid URL starting with http or https.");
    }
    if (!altText) {
      errors.push("Alt text is required for accessibility.");
      altField.setError("Alt text is required.");
    }

    if (errors.length) {
      message.textContent = errors.join(" ");
      message.className = "error-banner";
      return;
    }

    message.textContent = "";
    setLoading(true);

    try {
      await onSubmit({ id: currentId, title, url, altText, description });
      message.textContent = "Image entry saved.";
      message.className = "success-banner";
      if (!currentId) {
        formElement.reset();
      }
      currentId = null;
      idField.input.value = "";
      formElement.dataset.mode = "create";
      submitButton.textContent = "Save image";
    } catch (error) {
      console.error(error);
      message.textContent = parseError(error);
      message.className = "error-banner";
    } finally {
      setLoading(false);
    }
  });

  resetButton.addEventListener("click", () => {
    currentId = null;
    formElement.reset();
    idField.input.value = "";
    formElement.dataset.mode = "create";
    submitButton.textContent = "Save image";
    clearErrors();
    message.textContent = "";
    message.className = "helper-text";
  });

  function clearErrors() {
    titleField.clearError();
    urlField.clearError();
    altField.clearError();
    descriptionField.clearError();
  }

  function setLoading(value) {
    submitButton.disabled = value;
    resetButton.disabled = value;
    submitButton.textContent = value ? "Saving..." : formElement.dataset.mode === "edit" ? "Update image" : "Save image";
  }

  return {
    formElement,
    fill(item) {
      currentId = item.id;
      formElement.dataset.mode = "edit";
      idField.input.value = item.id;
      titleField.input.value = item.title || "";
      urlField.input.value = item.url || "";
      altField.input.value = item.altText || "";
      descriptionField.textarea.value = item.description || "";
      submitButton.textContent = "Update image";
      message.textContent = "Editing existing image entry.";
      message.className = "helper-text";
      clearErrors();
    },
    reset() {
      currentId = null;
      formElement.reset();
      idField.input.value = "";
      formElement.dataset.mode = "create";
      submitButton.textContent = "Save image";
    }
  };
}

function createTextInput({ id, label, required = false, placeholder = "", disabled = false }) {
  const field = document.createElement("div");
  field.className = "field";

  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", id);
  labelElement.textContent = label;

  const input = document.createElement("input");
  input.id = id;
  input.placeholder = placeholder;
  input.required = required;
  input.disabled = disabled;

  const error = document.createElement("div");
  error.className = "validation-error";

  field.append(labelElement, input, error);

  return {
    field,
    input,
    setError(message) {
      error.textContent = message;
    },
    clearError() {
      error.textContent = "";
    }
  };
}

function createTextarea({ id, label, required = false, placeholder = "" }) {
  const field = document.createElement("div");
  field.className = "field";

  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", id);
  labelElement.textContent = label;

  const textarea = document.createElement("textarea");
  textarea.id = id;
  textarea.placeholder = placeholder;
  textarea.required = required;

  const error = document.createElement("div");
  error.className = "validation-error";

  field.append(labelElement, textarea, error);

  return {
    field,
    textarea,
    setError(message) {
      error.textContent = message;
    },
    clearError() {
      error.textContent = "";
    }
  };
}

function parseError(error) {
  if (!error) {
    return "An unexpected error occurred.";
  }
  const message = typeof error === "string" ? error : error.message;
  return message || "An unexpected error occurred.";
}
