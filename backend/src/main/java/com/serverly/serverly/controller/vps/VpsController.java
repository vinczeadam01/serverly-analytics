package com.serverly.serverly.controller.vps;

import com.serverly.serverly.dto.vps.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/vps")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class VpsController {

    private final Random random = new Random();

    @GetMapping("/list")
    public ResponseEntity<List<VpsInstance>> getList() {
        List<VpsInstance> instances = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            instances.add(new VpsInstance(
                    "vps-" + i,
                    "vps-instance-" + i,
                    random.nextDouble(10, 95),
                    random.nextInt(2, 16) + " GB",
                    random.nextInt(20, 90) + "%",
                    random.nextInt(100, 1000) + " Mbps",
                    random.nextBoolean() ? "running" : "warning"
            ));
        }
        return ResponseEntity.ok(instances);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VpsInstance> getById(@PathVariable String id) {
        return ResponseEntity.ok(new VpsInstance(
                id,
                "vps-instance-" + id,
                random.nextDouble(10, 95),
                "8 GB",
                "45%",
                "500 Mbps",
                "running"
        ));
    }

    @GetMapping("/{id}/cpu-chart")
    public ResponseEntity<CpuChartData> getCpuChart(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(new CpuChartData(generateTimeSeriesData(30)));
    }

    @GetMapping("/{id}/memory-chart")
    public ResponseEntity<MemoryChartData> getMemoryChart(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(new MemoryChartData(generateTimeSeriesData(30)));
    }

    @GetMapping("/{id}/disk-chart")
    public ResponseEntity<DiskChartData> getDiskChart(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(new DiskChartData(generateTimeSeriesData(30)));
    }

    @GetMapping("/{id}/network-chart")
    public ResponseEntity<NetworkChartData> getNetworkChart(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(new NetworkChartData(generateTimeSeriesData(30)));
    }

    private List<ChartDataPoint> generateTimeSeriesData(int points) {
        List<ChartDataPoint> data = new ArrayList<>();
        long now = Instant.now().getEpochSecond();
        for (int i = points; i >= 0; i--) {
            data.add(new ChartDataPoint(
                    Instant.ofEpochSecond(now - (i * 300)).toString(),
                    random.nextDouble(10, 90)
            ));
        }
        return data;
    }
}
