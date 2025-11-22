package com.serverly.serverly.controller;

import com.serverly.serverly.dto.ChangePasswordRequest;
import com.serverly.serverly.dto.ProfileDto;
import com.serverly.serverly.dto.UpdateProfileRequest;
import com.serverly.serverly.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ProfileDto> getProfile(Authentication authentication) {
        ProfileDto profile = userService.getProfile(authentication.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileDto> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        ProfileDto profile = userService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok().build();
    }
}
