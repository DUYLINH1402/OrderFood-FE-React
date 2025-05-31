const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getToken = () => {
  const token = localStorage.getItem("accessToken");
  return token || null;
};

export const loginApi = async (loginData) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return await response.json(); // trả về token hoặc user info
};

export const registerApi = async (registerData) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Register failed");
  }

  return await response.json();
};
