import axios from "axios";
import keycloak from "../auth/keycloak";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    async (config) => {

        // Refresh token if it is close to expiry
        if (keycloak.authenticated) {
            try {
                await keycloak.updateToken(30);
            } catch (error) {
                console.error("Failed to refresh token", error);
                keycloak.logout();
                return config;
            }

            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;