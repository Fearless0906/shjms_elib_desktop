import axios from "axios";

export const BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://192.168.2.175:8000/api/v1";

export type CreateBorrowRequestPayload = {
  status?: string | null;
  response_notes?: string;
  student?: number | null;
  book: number | null;
};

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

export const createBorrowRequest = async (
  payload: CreateBorrowRequestPayload
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/borrow/requests/create/`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating borrow request:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create borrow request"
    );
  }
};

export const borrowBook = createBorrowRequest;
