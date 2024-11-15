import Cookies from "js-cookie";

export const logoutApi = () => {
  Cookies.remove("user-token");
  Cookies.remove("token-expiry");
};
