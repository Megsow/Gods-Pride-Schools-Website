export function createRouter({ onRouteChange, defaultRoute = "copy" }) {
  let currentRoute = getCurrentRoute();

  function getCurrentRoute() {
    const hash = window.location.hash.slice(1);
    return hash || defaultRoute;
  }

  function notify() {
    currentRoute = getCurrentRoute();
    onRouteChange(currentRoute);
  }

  window.addEventListener("hashchange", notify);

  notify();

  return {
    navigate(route) {
      if (!route) return;
      if (route.startsWith("#")) {
        route = route.slice(1);
      }
      if (currentRoute === route) {
        onRouteChange(currentRoute);
        return;
      }
      window.location.hash = `#${route}`;
    },
    teardown() {
      window.removeEventListener("hashchange", notify);
    }
  };
}
