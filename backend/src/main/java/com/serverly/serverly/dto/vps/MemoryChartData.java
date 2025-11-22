package com.serverly.serverly.dto.vps;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemoryChartData {
    private List<ChartDataPoint> data;
}
