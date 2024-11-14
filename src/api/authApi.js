import Cookies from "js-cookie";

export const logoutApi = () => {
  Cookies.remove("user-token");
  console.log("logged out");
};
