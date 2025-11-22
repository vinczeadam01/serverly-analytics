package com.serverly.serverly.dto.webhosting;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusCodesData {
    private List<StatusCode> statusCodes;
}
