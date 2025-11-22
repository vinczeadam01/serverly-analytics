package com.serverly.serverly.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String role; // admin, user, viewer
    private String status; // active, disabled, pending
    private String lastLogin; // ISO date string
}
