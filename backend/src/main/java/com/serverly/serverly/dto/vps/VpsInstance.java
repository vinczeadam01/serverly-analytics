package com.serverly.serverly.dto.vps;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VpsInstance {
    private String id;
    private String instance;
    private Double cpuUsage;
    private String memory;
    private String diskUsage;
    private String network;
    private String status;
}
