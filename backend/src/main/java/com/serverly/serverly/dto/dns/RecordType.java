package com.serverly.serverly.dto.dns;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecordType {
    private String type;
    private Long count;
    private Double percentage;
}
