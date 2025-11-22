package com.serverly.serverly.controller.kafka;

import com.serverly.serverly.dto.kafka.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/kafka")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class KafkaController {

    private final Random random = new Random();

    @GetMapping("/messages-chart")
    public ResponseEntity<MessagesChartData> getMessagesChart(@RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(new MessagesChartData(generateTimeSeriesData(30)));
    }

    @GetMapping("/top-topics")
    public ResponseEntity<List<TopTopic>> getTopTopics(@RequestParam(required = false, defaultValue = "24h") String period) {
        List<TopTopic> topics = new ArrayList<>();
        topics.add(new TopTopic("raw_logs", random.nextLong(100000, 500000)));
        topics.add(new TopTopic("processed_logs", random.nextLong(80000, 400000)));
        topics.add(new TopTopic("error_logs", random.nextLong(10000, 50000)));
        topics.add(new TopTopic("metrics", random.nextLong(50000, 200000)));
        topics.add(new TopTopic("alerts", random.nextLong(5000, 30000)));
        topics.sort((a, b) -> Long.compare(b.getValue(), a.getValue()));
        return ResponseEntity.ok(topics);
    }

    @GetMapping("/consumer-lag")
    public ResponseEntity<ConsumerLagData> getConsumerLag(@RequestParam(required = false, defaultValue = "24h") String period) {
        List<ConsumerLag> lags = new ArrayList<>();
        String[] consumers = {"log-processor", "metrics-aggregator", "alert-handler", "data-indexer"};
        String[] topics = {"raw_logs", "processed_logs", "error_logs", "metrics"};

        for (int i = 0; i < 5; i++) {
            lags.add(new ConsumerLag(
                    consumers[random.nextInt(consumers.length)],
                    topics[random.nextInt(topics.length)],
                    random.nextLong(0, 10000)
            ));
        }
        return ResponseEntity.ok(new ConsumerLagData(lags));
    }

    @GetMapping("/throughput-chart")
    public ResponseEntity<ThroughputChartData> getThroughputChart(@RequestParam(required = false, defaultValue = "24h") String period) {
        return ResponseEntity.ok(new ThroughputChartData(generateTimeSeriesData(30)));
    }

    private List<ChartDataPoint> generateTimeSeriesData(int points) {
        List<ChartDataPoint> data = new ArrayList<>();
        long now = Instant.now().getEpochSecond();
        for (int i = points; i >= 0; i--) {
            data.add(new ChartDataPoint(
                    Instant.ofEpochSecond(now - (i * 300)).toString(),
                    random.nextDouble(1000, 50000)
            ));
        }
        return data;
    }
}
