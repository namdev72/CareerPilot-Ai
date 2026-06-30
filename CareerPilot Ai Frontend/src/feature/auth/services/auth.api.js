//code for how frontend interact with backend
//M-1 fetch()
//M-2 axios()
import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
})

export async function register({ username, email, password }) {
  try {
    const respone = await api.post(
      "/auth/register",
      {
        username,
        email,
        password,
      },
    );
    return respone.data;
  } catch (error) {
    console.log(error);
  }
}

export async function login({ email, password }) {
    try {
        const response = await api.post(
            "/auth/login",
            {
                email,
                password
            }
        );

        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function logout() {
  try {
    const respone = await api.get(
      "/auth/logout"
    );
    return respone.data
  } catch (error) {
    console.log(error);
  }
}

export async function getMe() {
    try {
    const respone = await api.get(
      "/auth/get-me"
    );
    return respone.data
  } catch (error) {
    console.log(error);
  }
}
