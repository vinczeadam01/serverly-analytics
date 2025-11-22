package com.serverly.serverly.dto.webhosting;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopPage {
    private String url;
    private Long requests;
    private Double avgResponseTime;
}
