package com.serverly.serverly.dto.dns;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopDomain {
    private String domain;
    private Long queries;
}
