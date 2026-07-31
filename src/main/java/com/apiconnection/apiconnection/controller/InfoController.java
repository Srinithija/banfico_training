package com.apiconnection.apiconnection.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class InfoController {

    @GetMapping("/health")
    public String health() {
        return "Application Running";
    }

    @GetMapping("/api/info")
    public String info() {
        return "Spring Boot API Service";
    }

}