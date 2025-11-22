package com.serverly.serverly.dto.dns;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecordTypesData {
    private List<RecordType> recordTypes;
}
