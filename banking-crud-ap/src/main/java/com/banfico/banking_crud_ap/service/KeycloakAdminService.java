package com.banfico.banking_crud_ap.service;

import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KeycloakAdminService {

    @Value("${keycloak.admin.server-url}")
    private String serverUrl;

    @Value("${keycloak.admin.realm}")
    private String adminRealm;

    @Value("${keycloak.admin.client-id}")
    private String clientId;

    // ── Switched from client_credentials to password grant ────────────────────
    // admin-cli with admin username/password has full realm access by default.
    // No service account role configuration needed in Keycloak.
    @Value("${keycloak.admin.username}")
    private String adminUsername;

    @Value("${keycloak.admin.password}")
    private String adminPassword;

    @Value("${keycloak.admin.target-realm}")
    private String targetRealm;


    // ============================================================
    // Build authenticated Keycloak Admin client
    // Uses password grant with admin-cli — works without any
    // service account role assignments in Keycloak.
    // ============================================================

    private Keycloak getKeycloakClient() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(adminRealm)          // master
                .clientId(clientId)         // admin-cli
                .username(adminUsername)    // admin
                .password(adminPassword)    // admin
                .grantType("password")
                .build();
    }


    // ============================================================
    // Create Customer Login Account
    // ============================================================

    public String createCustomerUser(String email, String fullName) {

        Keycloak keycloak;

        // --------------------------------------------------------
        // 1. Authenticate with Keycloak
        // --------------------------------------------------------

        try {
            keycloak = getKeycloakClient();
        } catch (NotAuthorizedException ex) {
            throw new NotAuthorizedException(
                    "Keycloak authentication failed. " +
                    "Please check the admin username and password in application.properties.",
                    ex
            );
        }


        // --------------------------------------------------------
        // 2. Build User representation
        // --------------------------------------------------------

        UserRepresentation user = new UserRepresentation();
        user.setUsername(email);
        user.setEmail(email);
        user.setEmailVerified(false);
        user.setEnabled(true);

        String[] nameParts = fullName.trim().split("\\s+", 2);
        user.setFirstName(nameParts[0]);
        user.setLastName(nameParts.length > 1 ? nameParts[1] : "");


        // --------------------------------------------------------
        // 3. Required Actions
        //    VERIFY_EMAIL   → customer must verify their email
        //    UPDATE_PASSWORD → customer must set their own password
        // --------------------------------------------------------

        user.setRequiredActions(List.of("VERIFY_EMAIL", "UPDATE_PASSWORD"));


        // --------------------------------------------------------
        // 4. Create user in Keycloak
        // --------------------------------------------------------

        Response response;

        try {
            response = keycloak.realm(targetRealm).users().create(user);
        } catch (NotAuthorizedException ex) {
            throw new NotAuthorizedException(
                    "Keycloak rejected the user creation request. " +
                    "Please check admin credentials.",
                    ex
            );
        }

        int status = response.getStatus();

        if (status == 409) {
            response.close();
            throw new RuntimeException(
                    "A login account already exists for email: " + email +
                    ". Please use a different email address."
            );
        }

        if (status != 201) {
            String body = response.readEntity(String.class);
            response.close();
            throw new RuntimeException(
                    "Failed to create login account for " + email +
                    " (HTTP " + status + "): " + body
            );
        }


        // --------------------------------------------------------
        // 5. Extract the new user's UUID from Location header
        // --------------------------------------------------------

        String location = response.getHeaderString("Location");
        response.close();

        if (location == null || location.isBlank()) {
            throw new RuntimeException(
                    "Keycloak created the customer account " +
                    "but did not return the user ID."
            );
        }

        String keycloakUserId = location.substring(location.lastIndexOf('/') + 1);


        // --------------------------------------------------------
        // 6. Assign CUSTOMER realm role
        // --------------------------------------------------------

        try {
            RoleRepresentation customerRole = keycloak
                    .realm(targetRealm)
                    .roles()
                    .get("CUSTOMER")
                    .toRepresentation();

            keycloak.realm(targetRealm)
                    .users()
                    .get(keycloakUserId)
                    .roles()
                    .realmLevel()
                    .add(List.of(customerRole));

        } catch (Exception ex) {
            System.err.println(
                    "CUSTOMER ROLE ASSIGNMENT FAILED: " +
                    ex.getClass().getName() + " : " + ex.getMessage()
            );
            throw new RuntimeException(
                    "Customer account was created, but CUSTOMER role assignment failed. " +
                    "Cause: " + ex.getClass().getSimpleName() + " — " + ex.getMessage()
            );
        }


        // --------------------------------------------------------
        // 7. Send account activation email
        //    Customer clicks link → verifies email → sets password
        // --------------------------------------------------------

        try {
            keycloak.realm(targetRealm)
                    .users()
                    .get(keycloakUserId)
                    .executeActionsEmail(List.of("VERIFY_EMAIL", "UPDATE_PASSWORD"));

            System.out.println(
                    "[KeycloakAdminService] Activation email sent to: " + email
            );

        } catch (Exception ex) {
            // Non-fatal — user and role already created successfully.
            // Log the warning and continue.
            System.err.println(
                    "[KeycloakAdminService] WARNING: Could not send activation email to " +
                    email + " : " + ex.getMessage()
            );
        }


        // --------------------------------------------------------
        // 8. Return Keycloak user UUID
        // --------------------------------------------------------

        return keycloakUserId;
    }


    // ============================================================
    // Delete Customer Login Account
    // Called when Admin deletes a customer.
    // Non-fatal — DB deletion proceeds even if this fails.
    // ============================================================

    public void deleteKeycloakUser(String keycloakId) {
        if (keycloakId == null || keycloakId.isBlank()) return;

        try {
            Keycloak keycloak = getKeycloakClient();
            keycloak.realm(targetRealm).users().delete(keycloakId);
            System.out.println(
                    "[KeycloakAdminService] Deleted Keycloak user: " + keycloakId
            );
        } catch (Exception ex) {
            System.err.println(
                    "[KeycloakAdminService] Warning: could not delete Keycloak user " +
                    keycloakId + ": " + ex.getMessage()
            );
        }
    }
}
