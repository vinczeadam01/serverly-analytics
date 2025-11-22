package com.serverly.serverly.controller.webhosting;

import com.serverly.serverly.dto.webhosting.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/webhosting")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class WebhostingController {

    private final Random random = new Random();

    @GetMapping("/list")
    public ResponseEntity<List<WebhostingAccount>> getList() {
        List<WebhostingAccount> accounts = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            accounts.add(new WebhostingAccount(
                    "web-" + i,
                    "website" + i + ".com",
                    random.nextBoolean() ? "active" : "warning",
                    random.nextLong(10000, 500000),
                    random.nextInt(10, 100) + " GB"
            ));
        }
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebhostingAccount> getById(@PathVariable String id) {
        return ResponseEntity.ok(new WebhostingAccount(
                id,
                "website.com",
                "active",
                random.nextLong(10000, 500000),
                "50 GB"
        ));
    }

    @GetMapping("/{id}/traffic-chart")
    public ResponseEntity<TrafficChartData> getTrafficChart(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(new TrafficChartData(generateTimeSeriesData(30)));
    }

    @GetMapping("/{id}/top-pages")
    public ResponseEntity<List<TopPage>> getTopPages(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        List<TopPage> pages = new ArrayList<>();
        String[] urls = {"/", "/about", "/contact", "/products", "/blog", "/services", "/pricing", "/faq", "/login", "/dashboard"};
        for (String url : urls) {
            pages.add(new TopPage(
                    url,
                    random.nextLong(100, 10000),
                    random.nextDouble(50, 500)
            ));
        }
        pages.sort((a, b) -> Long.compare(b.getRequests(), a.getRequests()));
        return ResponseEntity.ok(pages);
    }

    @GetMapping("/{id}/status-codes")
    public ResponseEntity<StatusCodesData> getStatusCodes(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        long total = random.nextLong(100000, 500000);
        List<StatusCode> codes = new ArrayList<>();
        codes.add(new StatusCode(200, (long)(total * 0.85), 85.0));
        codes.add(new StatusCode(301, (long)(total * 0.05), 5.0));
        codes.add(new StatusCode(404, (long)(total * 0.07), 7.0));
        codes.add(new StatusCode(500, (long)(total * 0.03), 3.0));
        return ResponseEntity.ok(new StatusCodesData(codes));
    }

    @GetMapping("/{id}/bandwidth-chart")
    public ResponseEntity<BandwidthChartData> getBandwidthChart(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(new BandwidthChartData(generateTimeSeriesData(30)));
    }

    private List<ChartDataPoint> generateTimeSeriesData(int points) {
        List<ChartDataPoint> data = new ArrayList<>();
        long now = Instant.now().getEpochSecond();
        for (int i = points; i >= 0; i--) {
            data.add(new ChartDataPoint(
                    Instant.ofEpochSecond(now - (i * 300)).toString(),
                    random.nextDouble(100, 10000)
            ));
        }
        return data;
    }
}
