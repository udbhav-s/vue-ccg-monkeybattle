import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.response.use((res) => {
  if (!res.data.success) {
    throw new Error("An error occured");
  }
  return res.data.data;
});

export default api;
