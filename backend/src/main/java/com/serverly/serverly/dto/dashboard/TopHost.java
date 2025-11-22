package com.serverly.serverly.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopHost {
    private String host;
    private String service;
    private Long totalRequests;
    private Double errorRate;
    private Double avgLatency;
    private String status;
}
