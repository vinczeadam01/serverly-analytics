package com.serverly.serverly.controller.email;

import com.serverly.serverly.dto.email.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class EmailController {

    private final Random random = new Random();

    @GetMapping("/list")
    public ResponseEntity<List<EmailAccount>> getList() {
        List<EmailAccount> accounts = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            accounts.add(new EmailAccount(
                    "email-" + i,
                    "domain" + i + ".com",
                    random.nextBoolean() ? "active" : "warning",
                    random.nextLong(1000, 100000),
                    random.nextDouble(95, 99.9)
            ));
        }
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailAccount> getById(@PathVariable String id) {
        return ResponseEntity.ok(new EmailAccount(
                id,
                "domain.com",
                "active",
                random.nextLong(1000, 100000),
                random.nextDouble(95, 99.9)
        ));
    }

    @GetMapping("/{id}/flow-chart")
    public ResponseEntity<FlowChartData> getFlowChart(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        long inbound = random.nextLong(50000, 200000);
        long outbound = random.nextLong(40000, 150000);
        long bounced = random.nextLong(1000, 5000);
        long spam = random.nextLong(2000, 10000);
        long total = inbound + outbound + bounced + spam;

        List<EmailFlowItem> flow = new ArrayList<>();
        flow.add(new EmailFlowItem("Inbound", inbound, (inbound * 100.0 / total), "#3B82F6"));
        flow.add(new EmailFlowItem("Outbound", outbound, (outbound * 100.0 / total), "#10B981"));
        flow.add(new EmailFlowItem("Bounced", bounced, (bounced * 100.0 / total), "#EF4444"));
        flow.add(new EmailFlowItem("Spam", spam, (spam * 100.0 / total), "#F59E0B"));

        return ResponseEntity.ok(new FlowChartData(flow));
    }

    @GetMapping("/{id}/top-recipients")
    public ResponseEntity<List<TopRecipient>> getTopRecipients(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        List<TopRecipient> recipients = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            recipients.add(new TopRecipient(
                    "user" + i + "@domain.com",
                    random.nextLong(100, 5000)
            ));
        }
        recipients.sort((a, b) -> Long.compare(b.getReceived(), a.getReceived()));
        return ResponseEntity.ok(recipients);
    }

    @GetMapping("/{id}/top-senders")
    public ResponseEntity<List<TopSender>> getTopSenders(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        List<TopSender> senders = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            senders.add(new TopSender(
                    "sender" + i + "@domain.com",
                    random.nextLong(100, 5000)
            ));
        }
        senders.sort((a, b) -> Long.compare(b.getSent(), a.getSent()));
        return ResponseEntity.ok(senders);
    }

    @GetMapping("/{id}/servers")
    public ResponseEntity<List<ServerMetrics>> getServers(@PathVariable String id, @RequestParam(required = false, defaultValue = "24h") String period) {
        List<ServerMetrics> servers = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            servers.add(new ServerMetrics(
                    "mail-server-" + i,
                    random.nextLong(10000, 100000),
                    random.nextDouble(95, 99.9),
                    random.nextInt(0, 100),
                    random.nextDouble(0.1, 0.9),
                    random.nextBoolean() ? "healthy" : "warning"
            ));
        }
        return ResponseEntity.ok(servers);
    }
}
