import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import keycloak from "./auth/keycloak";

keycloak.init({
    onLoad: "login-required",
    checkLoginIframe: false,
}).then((authenticated) => {

    if (authenticated) {
        console.log("Keycloak login successful");
        console.log("Username:", keycloak.tokenParsed?.preferred_username);
        console.log("Roles:", keycloak.tokenParsed?.realm_access?.roles);

        createRoot(document.getElementById("root")).render(
            <StrictMode>
                <App />
            </StrictMode>
        );
    } else {
        console.log("User is not authenticated");
    }

}).catch((error) => {
    console.error("Keycloak initialization failed:", error);
});