import { signInWithEmail, signInWithGoogle } from "../../firebase/config.js";

export function renderLoginView(root, { onSuccess, credentials } = {}) {
  root.innerHTML = "";

  const card = document.createElement("section");
  card.className = "login-card";

  const title = document.createElement("h1");
  title.textContent = "Admin Login";

  const description = document.createElement("p");
  description.className = "helper-text";
  description.textContent =
    "Sign in with an administrator account to manage site copy and media metadata.";

  const credentialsNote = document.createElement("p");
  credentialsNote.className = "helper-text";
  credentialsNote.textContent =
    "Default admin credentials are pre-filled below for convenience.";

  const form = document.createElement("form");
  form.noValidate = true;

  const emailField = createField({
    label: "Email",
    type: "email",
    id: "admin-email",
    autocomplete: "email"
  });

  const passwordField = createField({
    label: "Password",
    type: "password",
    id: "admin-password",
    placeholder: "••••••••",
    autocomplete: "current-password"
  });

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "primary-btn";
  submitButton.textContent = "Sign in";

  const googleButton = document.createElement("button");
  googleButton.type = "button";
  googleButton.className = "secondary-btn";
  googleButton.textContent = "Sign in with Google";

  const status = document.createElement("div");
  status.className = "helper-text";

  form.append(emailField.field, passwordField.field, submitButton);

  emailField.input.value = DEFAULT_ADMIN_EMAIL;
  passwordField.input.value = DEFAULT_ADMIN_PASSWORD;

  card.append(title, description, credentialsNote, form, googleButton, status);
  root.append(card);

  if (credentials) {
    prefillCredentials(credentials);
  }

  let isSubmitting = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    clearStatus();

    const email = emailField.input.value.trim();
    const password = passwordField.input.value;

    const validationErrors = [];
    if (!email) {
      validationErrors.push("Email is required.");
      emailField.setError("Please enter your email address.");
    } else if (!emailField.input.checkValidity()) {
      validationErrors.push("Enter a valid email address.");
      emailField.setError("Enter a valid email address.");
    }

    if (!password) {
      validationErrors.push("Password is required.");
      passwordField.setError("Please provide your password.");
    }

    if (validationErrors.length) {
      setStatus(validationErrors.join(" "), true);
      return;
    }

    isSubmitting = true;
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      setStatus("Signed in successfully.");
      onSuccess?.();
    } catch (error) {
      console.error(error);
      setStatus(parseFirebaseError(error), true);
    } finally {
      isSubmitting = false;
      setLoading(false);
    }
  });

  googleButton.addEventListener("click", async () => {
    if (isSubmitting) return;
    clearStatus();
    isSubmitting = true;
    setLoading(true, googleButton);
    try {
      await signInWithGoogle();
      setStatus("Signed in successfully.");
      onSuccess?.();
    } catch (error) {
      console.error(error);
      setStatus(parseFirebaseError(error), true);
    } finally {
      isSubmitting = false;
      setLoading(false, googleButton);
    }
  });

  function clearStatus() {
    emailField.clearError();
    passwordField.clearError();
    status.textContent = "";
    status.classList.remove("error-banner", "success-banner");
  }

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("error-banner", isError);
    status.classList.toggle("success-banner", !isError);
  }

  function setLoading(value, button = submitButton) {
    button.disabled = value;
    submitButton.disabled = value;
    passwordField.input.disabled = value;
    emailField.input.disabled = value;
    if (value) {
      button.dataset.originalText = button.textContent;
      button.textContent = "Signing in...";
    } else if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }

  function prefillCredentials({ email, password } = {}) {
    if (typeof email === "string") {
      emailField.input.value = email;
    }
    if (typeof password === "string") {
      passwordField.input.value = password;
    }
  }
}

function createField({ label, type, id, placeholder, autocomplete }) {
  const field = document.createElement("div");
  field.className = "field";

  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", id);
  labelElement.textContent = label;

  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  input.placeholder = placeholder || "";
  if (autocomplete) {
    input.autocomplete = autocomplete;
  }

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

function parseFirebaseError(error) {
  if (!error) return "An unknown error occurred.";
  const message = typeof error === "string" ? error : error.message;
  if (!message) return "An unknown error occurred.";
  if (message.includes("auth/wrong-password")) {
    return "Incorrect password. Please try again.";
  }
  if (message.includes("auth/user-not-found")) {
    return "No admin user found with that email.";
  }
  if (message.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (message.includes("auth/popup-closed")) {
    return "Google sign-in was cancelled.";
  }
  return message;
}
