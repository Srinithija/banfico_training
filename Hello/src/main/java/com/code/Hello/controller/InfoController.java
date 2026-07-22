package com.code.Hello.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class InfoController {

    public InfoController() {
        System.out.println("InfoController Loaded");
    }

    @GetMapping("/")
    public String home() {
        return "Home Page";
    }

    @GetMapping("/health")
    public String health() {
        return "Application Running";
    }

    @GetMapping("/api/info")
    public String info() {
        return "Week 1 Backend";
    }
}