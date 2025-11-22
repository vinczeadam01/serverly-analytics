package com.serverly.serverly.dto.email;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailFlowItem {
    private String label;
    private Long count;
    private Double percentage;
    private String color;
}
