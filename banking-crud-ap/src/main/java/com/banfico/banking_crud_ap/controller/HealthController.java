package com.banfico.banking_crud_ap.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
                "status", "UP",
                "service", "Banking API"
        );
    }

    @GetMapping("/api/info")
    public Map<String, String> info() {
        return Map.of(
                "application", "Banking CRUD API",
                "version", "1.0.0",
                "description", "Banfico internship banking backend"
        );
    }
}
