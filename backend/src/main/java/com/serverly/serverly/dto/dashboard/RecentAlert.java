package com.serverly.serverly.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentAlert {
    private String type;
    private String message;
    private String timestamp;
}
