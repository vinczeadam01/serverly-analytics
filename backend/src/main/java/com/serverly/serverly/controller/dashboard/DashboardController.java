package com.serverly.serverly.controller.dashboard;

import com.serverly.serverly.dto.dashboard.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class DashboardController {

    private final Random random = new Random();

    @GetMapping
    public ResponseEntity<DashboardData> getSystemDashboard(@RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(generateMockDashboardData());
    }

    @GetMapping("/email")
    public ResponseEntity<DashboardData> getEmailDashboard(@RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(generateMockDashboardData());
    }

    @GetMapping("/vps")
    public ResponseEntity<DashboardData> getVpsDashboard(@RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(generateMockDashboardData());
    }

    @GetMapping("/webhosting")
    public ResponseEntity<DashboardData> getWebhostingDashboard(@RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(generateMockDashboardData());
    }

    @GetMapping("/dns")
    public ResponseEntity<DashboardData> getDnsDashboard(@RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(generateMockDashboardData());
    }

    @GetMapping("/kafka")
    public ResponseEntity<DashboardData> getKafkaDashboard(@RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(generateMockDashboardData());
    }

    private DashboardData generateMockDashboardData() {
        DashboardData data = new DashboardData();
        data.setTotalRequests(random.nextLong(1000000, 5000000));
        data.setErrorRate(random.nextDouble(0.5, 5.0));
        data.setAvgResponseTime(random.nextDouble(50, 500));
        data.setActiveHosts(random.nextInt(10, 50));

        List<ServiceBreakdown> services = new ArrayList<>();
        services.add(new ServiceBreakdown("Email", random.nextLong(100000, 500000), random.nextDouble(20, 30)));
        services.add(new ServiceBreakdown("DNS", random.nextLong(200000, 800000), random.nextDouble(30, 40)));
        services.add(new ServiceBreakdown("Webhosting", random.nextLong(150000, 600000), random.nextDouble(15, 25)));
        services.add(new ServiceBreakdown("VPS", random.nextLong(80000, 400000), random.nextDouble(10, 20)));
        data.setServiceBreakdown(services);

        List<RecentAlert> alerts = new ArrayList<>();
        alerts.add(new RecentAlert("warning", "High CPU usage on VPS-01", Instant.now().minusSeconds(300).toString()));
        alerts.add(new RecentAlert("error", "Email queue backup on mail-server-02", Instant.now().minusSeconds(600).toString()));
        alerts.add(new RecentAlert("info", "Scheduled maintenance completed", Instant.now().minusSeconds(900).toString()));
        data.setRecentAlerts(alerts);

        List<TopHost> hosts = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            hosts.add(new TopHost(
                    "host-" + i + ".serverly.com",
                    i % 2 == 0 ? "Email" : "DNS",
                    random.nextLong(10000, 100000),
                    random.nextDouble(0.1, 3.0),
                    random.nextDouble(20, 200),
                    random.nextBoolean() ? "healthy" : "warning"
            ));
        }
        data.setTopHosts(hosts);

        return data;
    }
}
