package com.serverly.serverly.dto;

import lombok.Data;

@Data
public class ProfileDto {
    private Long id;
    private String name;
    private String email;
    private String role;
}
