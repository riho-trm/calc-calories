import store from "../store";

export const authorizeToken = (to: any, from: any, next: any) => {
  if (
    to.matched.some((page: any) => page.meta.requiresAuth) &&
    (store.state.auth.token === null || store.state.auth.token === undefined)
  ) {
    next("/login");
  } else {
    next();
  }
};
