package com.banfico.banking_crud_ap.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.Customizer;

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

                // IMPORTANT: Enable CORS
                .cors(Customizer.withDefaults())

                .authorizeHttpRequests(auth -> auth

                        // IMPORTANT: Allow browser preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/accounts/**")
                        .authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/accounts")
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/accounts/*/transactions"
                        )
                        .hasRole("MAKER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/accounts/*/transactions"
                        )
                        .authenticated()

                        .requestMatchers("/api/beneficiaries")
                        .authenticated()

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/beneficiaries/*"
                        )
                        .hasAnyRole("ADMIN", "CHECKER")

                        .requestMatchers("/api/customers/**")
                        .authenticated()

                        .anyRequest()
                        .authenticated()
                )

                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter
                                )
                        )
                );

        return http.build();
    }
}