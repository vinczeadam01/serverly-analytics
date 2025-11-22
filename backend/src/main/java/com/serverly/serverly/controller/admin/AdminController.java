package com.serverly.serverly.controller.admin;

import com.serverly.serverly.dto.admin.CreateUserRequest;
import com.serverly.serverly.dto.admin.UpdateUserRequest;
import com.serverly.serverly.dto.admin.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    private final Random random = new Random();
    private final List<UserDto> mockUsers = new ArrayList<>();
    private Long nextId = 1L;

    public AdminController() {
        // Initialize with some mock data
        initializeMockUsers();
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getUsers() {
        return ResponseEntity.ok(new ArrayList<>(mockUsers));
    }

    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@RequestBody CreateUserRequest request) {
        UserDto user = new UserDto(
                nextId++,
                request.getName(),
                request.getEmail(),
                request.getRole(),
                request.getStatus(),
                Instant.now().toString()
        );
        mockUsers.add(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        UserDto user = mockUsers.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());

        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        boolean removed = mockUsers.removeIf(u -> u.getId().equals(id));

        if (removed) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    private void initializeMockUsers() {
        String[] roles = {"admin", "user", "viewer"};
        String[] statuses = {"active", "disabled", "pending"};

        for (int i = 1; i <= 42; i++) {
            mockUsers.add(new UserDto(
                    nextId++,
                    "User " + i,
                    "user" + i + "@serverly.com",
                    roles[random.nextInt(roles.length)],
                    statuses[random.nextInt(statuses.length)],
                    Instant.now().minusSeconds(random.nextInt(1209600)).toString() // Random time in last 14 days
            ));
        }
    }
}
