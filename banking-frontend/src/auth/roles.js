import keycloak from "./keycloak";

export const hasRole = (role) => {
    const roles = keycloak.tokenParsed?.realm_access?.roles || [];

    return roles.includes(role);
};