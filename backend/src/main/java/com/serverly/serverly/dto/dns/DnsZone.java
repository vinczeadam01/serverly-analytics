package com.serverly.serverly.dto.dns;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DnsZone {
    private String id;
    private String zone;
    private String status;
    private Long totalQueries;
    private Double avgResponseTime;
}
