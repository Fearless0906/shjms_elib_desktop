import axios from "axios";

export const BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://192.168.2.175:8000/api/v1";

const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const fetchBooks = async (page = 1, search = "") => {
  try {
    const response = await axios.get(
      `${BASE_URL}/marc/search/?page=${page}&page_size=10&search=${encodeURIComponent(
        search
      )}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch books");
  }
};

export const borrowBook = async (borrowData: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/borrow/`, borrowData);
    return response.data;
  } catch (error: any) {
    console.error("Error borrowing book:", error);
    throw new Error(error.response?.data?.message || "Failed to borrow book");
  }
};
