package com.serverly.serverly.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceBreakdown {
    private String service;
    private Long requests;
    private Double percentage;
}
