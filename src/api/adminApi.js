import { toast } from "sonner";
import axiosInstance from "../utils/axiosInstance";

export const getFileTypeApi = async () => {
  // toast.warning("Data is not available");
  // return;
  try {
    const response = await axiosInstance.get("/get_all_document-types");
    if (response?.status === 200) {
      return response.data;
    } else {
      toast.error("Error, please try again");
      return null;
    }
  } catch (error) {
    console.error("API Error:", error.message);
    return null;
  }
};

export const addFileTypeApi = async (formData) => {
  try {
    const response = await axiosInstance.post("/document-types", formData);
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
export const updateFileTypeApi = async (formData) => {
  try {
    const response = await axiosInstance.post("/api", formData);
    if (response?.status === 200) {
      return response.data;
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

export const deleteFileTypeApi = async (id) => {
  // toast.warning("This feature is not available");
  // return;
  try {
    const response = await axiosInstance.delete(`/document-types/${id}`);
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
