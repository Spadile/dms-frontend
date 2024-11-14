export const parseJWT = (token) => {
  if (typeof token !== "string" || !token.includes(".")) {
    console.error("Invalid JWT format");
    return null;
  }

  try {
    const base64Url = token?.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid JWT:", error);
    return null;
  }
};
