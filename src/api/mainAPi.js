import { toast } from "sonner";
import axiosInstance from "../utils/axiosInstance";

export const mergeFilesApi = async (formData) => {
  // console.log("formData", formData);
  // for (const [key, value] of formData.entries()) {
  //   console.log(`${key}:`, value);
  // }
  try {
    const response = await axiosInstance.post(
      "/upload-multiple-files",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response?.status === 200) {
      return response;
    } else {
      toast.error("Error, please try again");
      return null;
    }
  } catch (error) {
    console.error("API Error:", error.message);
    toast.error("An error occurred. Please try again.");
    return null;
  }
};

export const compressFilesApi = async (fileurl) => {
  try {
    const response = await axiosInstance.get(`/compressed-pdf/${fileurl}`);
    if (response?.status === 200) {
      return response;
    } else {
      toast.error("Error, please try again");
      return null;
    }
  } catch (error) {
    console.error("API Error:", error.message);
    toast.error("An error occurred. Please try again.");
    return null;
  }
};

export const getFileSize = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl, { method: "HEAD" });
    const fileSize = response.headers.get("content-length"); // Returns file size in bytes
    return fileSize;
  } catch (error) {
    console.error("Error fetching file size:", error);
  }
};
