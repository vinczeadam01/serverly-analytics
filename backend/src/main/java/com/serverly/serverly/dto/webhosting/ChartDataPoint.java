package com.serverly.serverly.dto.webhosting;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChartDataPoint {
    private String timestamp;
    private Double value;
}
