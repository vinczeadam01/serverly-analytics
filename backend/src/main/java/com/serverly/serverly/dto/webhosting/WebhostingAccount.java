package com.serverly.serverly.dto.webhosting;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebhostingAccount {
    private String id;
    private String domain;
    private String status;
    private Long totalRequests;
    private String bandwidth;
}
