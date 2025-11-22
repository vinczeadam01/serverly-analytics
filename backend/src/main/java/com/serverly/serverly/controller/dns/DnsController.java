package com.serverly.serverly.controller.dns;

import com.serverly.serverly.dto.dns.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/dns")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class DnsController {

    private final Random random = new Random();

    @GetMapping("/list")
    public ResponseEntity<List<DnsZone>> getList() {
        List<DnsZone> zones = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            zones.add(new DnsZone(
                    "dns-" + i,
                    "zone" + i + ".com",
                    random.nextBoolean() ? "active" : "warning",
                    random.nextLong(100000, 1000000),
                    random.nextDouble(1, 50)
            ));
        }
        return ResponseEntity.ok(zones);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DnsZone> getById(@PathVariable String id) {
        return ResponseEntity.ok(new DnsZone(
                id,
                "example.com",
                "active",
                random.nextLong(100000, 1000000),
                random.nextDouble(1, 50)
        ));
    }

    @GetMapping("/{id}/query-chart")
    public ResponseEntity<QueryChartData> getQueryChart(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(new QueryChartData(generateTimeSeriesData(30)));
    }

    @GetMapping("/{id}/top-domains")
    public ResponseEntity<List<TopDomain>> getTopDomains(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        List<TopDomain> domains = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            domains.add(new TopDomain(
                    "subdomain" + i + ".example.com",
                    random.nextLong(1000, 100000)
            ));
        }
        domains.sort((a, b) -> Long.compare(b.getQueries(), a.getQueries()));
        return ResponseEntity.ok(domains);
    }

    @GetMapping("/{id}/record-types")
    public ResponseEntity<RecordTypesData> getRecordTypes(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        long total = random.nextLong(100000, 500000);
        List<RecordType> types = new ArrayList<>();
        types.add(new RecordType("A", (long)(total * 0.50), 50.0));
        types.add(new RecordType("AAAA", (long)(total * 0.20), 20.0));
        types.add(new RecordType("CNAME", (long)(total * 0.15), 15.0));
        types.add(new RecordType("MX", (long)(total * 0.10), 10.0));
        types.add(new RecordType("TXT", (long)(total * 0.05), 5.0));
        return ResponseEntity.ok(new RecordTypesData(types));
    }

    @GetMapping("/{id}/response-time-chart")
    public ResponseEntity<ResponseTimeChartData> getResponseTimeChart(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(new ResponseTimeChartData(generateTimeSeriesData(30)));
    }

    private List<ChartDataPoint> generateTimeSeriesData(int points) {
        List<ChartDataPoint> data = new ArrayList<>();
        long now = Instant.now().getEpochSecond();
        for (int i = points; i >= 0; i--) {
            data.add(new ChartDataPoint(
                    Instant.ofEpochSecond(now - (i * 300)).toString(),
                    random.nextDouble(1, 100)
            ));
        }
        return data;
    }
}
