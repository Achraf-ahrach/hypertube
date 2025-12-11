

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // NestJS URL
  withCredentials: true,            // This allows cookies to be sent/received
});

export default api;