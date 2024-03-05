import { resetUserInfo } from "./rootSlice";

const errorMiddleware = (storeAPI) => (next) => (action) => {
  if (action.error && action.error?.response?.status === 401) {
    sessionStorage.setItem("access_token", "");
    storeAPI.dispatch(resetUserInfo());
    window.location.href = "/sign-in";
  }
  return next(action);
};

export default errorMiddleware;
