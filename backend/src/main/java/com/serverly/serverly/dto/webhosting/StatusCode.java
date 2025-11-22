package com.serverly.serverly.dto.webhosting;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusCode {
    private Integer code;
    private Long count;
    private Double percentage;
}
