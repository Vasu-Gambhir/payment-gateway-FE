// export const baseURL = "http://localhost:5000/api/v1";
export const baseURL = "https://payment-gateway-be.onrender.com/api/v1";

export const getHeaders = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};
