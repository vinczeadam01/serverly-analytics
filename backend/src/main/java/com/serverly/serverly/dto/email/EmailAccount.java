package com.serverly.serverly.dto.email;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailAccount {
    private String id;
    private String domain;
    private String status;
    private Long totalEmails;
    private Double deliveryRate;
}
