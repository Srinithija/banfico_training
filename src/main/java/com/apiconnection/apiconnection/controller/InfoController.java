package com.apiconnection.apiconnection.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@RestController
public class InfoController {

    @GetMapping("/health")
    public String health() {
        return "Application Running";
    }

    @GetMapping("/api/info")
    public Map<String, String> info() throws Exception {

        Properties properties = new Properties();

        InputStream input = new ClassPathResource("git.properties").getInputStream();
        properties.load(input);

        Map<String, String> response = new HashMap<>();

        response.put("branch", properties.getProperty("git.branch"));
        response.put("commitId", properties.getProperty("git.commit.id.abbrev"));
        response.put("commitMessage", properties.getProperty("git.commit.message.short"));

        return response;
    }
}