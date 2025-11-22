package com.serverly.serverly.dto.email;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServerMetrics {
    private String server;
    private Long totalProcessed;
    private Double deliveryRate;
    private Integer queueSize;
    private Double load;
    private String status;
}
