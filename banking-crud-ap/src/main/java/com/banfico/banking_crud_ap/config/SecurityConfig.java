package com.banfico.banking_crud_ap.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        JwtAuthenticationConverter jwtAuthenticationConverter =
                new JwtAuthenticationConverter();

        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(
                jwt -> new KeycloakRoleConverter()
                        .convert(jwt)
                        .getAuthorities()
        );

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())

                .authorizeHttpRequests(auth -> auth

                        // ── Browser preflight ─────────────────────────────────
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ── Account Requests ──────────────────────────────────
                        // Customer submits + views own requests
                        .requestMatchers(HttpMethod.POST, "/api/account-requests")
                        .hasRole("CUSTOMER")

                        .requestMatchers(HttpMethod.GET, "/api/account-requests/my")
                        .hasRole("CUSTOMER")

                        // Admin manages requests
                        .requestMatchers(HttpMethod.GET, "/api/account-requests/admin/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/account-requests/*/approve")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/account-requests/*/reject")
                        .hasRole("ADMIN")

                        // ── Customer self-service portal ──────────────────────
                        // CUSTOMER role only — scoped to their own data
                        // Must be declared BEFORE the broader /api/accounts/**
                        // and /api/customers/** rules below
                        .requestMatchers("/api/customer/**")
                        .hasRole("CUSTOMER")
                        // ── Accounts (staff) ──────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/accounts/**")
                        .authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/accounts")
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/accounts/*/transactions")
                        .hasRole("MAKER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/accounts/*/transactions")
                        .authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/accounts/*/transactions/*/approve")
                        .hasRole("CHECKER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/accounts/*/transactions/*/reject")
                        .hasRole("CHECKER")

                        // ── Beneficiaries (staff) ─────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/beneficiaries")
                        .hasRole("MAKER")

                        .requestMatchers(HttpMethod.GET, "/api/beneficiaries")
                        .authenticated()

                        .requestMatchers(HttpMethod.GET, "/api/beneficiaries/**")
                        .authenticated()

                        .requestMatchers(HttpMethod.PUT, "/api/beneficiaries/*/approve")
                        .hasRole("CHECKER")

                        .requestMatchers(HttpMethod.PUT, "/api/beneficiaries/*/reject")
                        .hasRole("CHECKER")

                        .requestMatchers(HttpMethod.DELETE, "/api/beneficiaries/*")
                        .hasAnyRole("ADMIN", "CHECKER")

                        // ── Customers ─────────────────────────────────────────
                        .requestMatchers(HttpMethod.DELETE, "/api/customers/*")
                        .hasRole("ADMIN")

                        .requestMatchers("/api/customers/**")
                        .authenticated()

                        // ── Consents ──────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/consents")
                        .hasRole("MAKER")

                        .requestMatchers(HttpMethod.GET, "/api/consents")
                        .authenticated()

                        .requestMatchers(HttpMethod.GET, "/api/consents/**")
                        .authenticated()

                        .requestMatchers(HttpMethod.PUT, "/api/consents/*/approve")
                        .hasRole("CHECKER")

                        .requestMatchers(HttpMethod.PUT, "/api/consents/*/reject")
                        .hasRole("CHECKER")

                        // ── Catch-all ─────────────────────────────────────────
                        .anyRequest()
                        .authenticated()
                )

                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter)
                        )
                );

        return http.build();
    }
}
