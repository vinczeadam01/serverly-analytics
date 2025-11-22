package com.serverly.serverly.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardData {
    private Long totalRequests;
    private Double errorRate;
    private Double avgResponseTime;
    private Integer activeHosts;
    private List<ServiceBreakdown> serviceBreakdown;
    private List<RecentAlert> recentAlerts;
    private List<TopHost> topHosts;
}
