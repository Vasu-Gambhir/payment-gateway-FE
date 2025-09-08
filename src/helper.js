export const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const getHeaders = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};
