package com.serverly.serverly.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @GetMapping("/profile")
    public ResponseEntity<Map<String, String>> getProfile(Authentication authentication) {
        Map<String, String> profile = new HashMap<>();
        profile.put("username", authentication.getName());
        profile.put("message", "This is a protected endpoint");
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/hello")
    public ResponseEntity<Map<String, String>> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello from protected endpoint!");
        return ResponseEntity.ok(response);
    }
}
