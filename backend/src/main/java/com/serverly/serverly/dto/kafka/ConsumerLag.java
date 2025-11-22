package com.serverly.serverly.dto.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsumerLag {
    private String consumer;
    private String topic;
    private Long lag;
}
