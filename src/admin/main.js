import { watchAuthState } from "../firebase/config.js";
import { renderLoginView } from "./views/login.js";
import { renderDashboardView } from "./views/dashboard.js";

const root = document.getElementById("admin-app");
if (!root) {
  throw new Error("Admin root element #admin-app not found. Make sure admin/index.html has this element.");
}

let cleanupView = null;

function showLogin() {
  cleanupView?.();
  renderLoginView(root, {
    onSuccess: () => {
      // Auth listener will re-render when state changes.
    }
  });
}

function showDashboard(user) {
  cleanupView?.();
  cleanupView = renderDashboardView(root, { user });
}

watchAuthState((user) => {
  if (user) {
    showDashboard(user);
  } else {
    showLogin();
  }
});
