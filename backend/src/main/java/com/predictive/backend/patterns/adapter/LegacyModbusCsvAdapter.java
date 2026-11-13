package com.predictive.backend.patterns.adapter;

import com.predictive.backend.dto.SensorReadingRequestDto;
import org.springframework.stereotype.Component;

/**
 * Adapter Pattern - Concrete Adapter 1: Legacy Modbus / Industrial CSV Telemetry
 * 
 * Adapts comma-delimited sensor strings from legacy PLC/SCADA controllers:
 * Format: "TEMPERATURE,VIBRATION,OPERATING_HOURS[,STRATEGY]"
 * Example: "68.5,4.2,3450.0,vibration"
 */
@Component
public class LegacyModbusCsvAdapter implements TelemetryAdapter {

    @Override
    public SensorReadingRequestDto adapt(String rawPayload) {
        if (rawPayload == null || rawPayload.trim().isEmpty()) {
            throw new IllegalArgumentException("Payload cannot be empty");
        }

        String[] tokens = rawPayload.split(",");
        if (tokens.length < 3) {
            throw new IllegalArgumentException("Legacy CSV payload must contain at least: temp,vib,hours");
        }

        try {
            double temp = Double.parseDouble(tokens[0].trim());
            double vib = Double.parseDouble(tokens[1].trim());
            double hours = Double.parseDouble(tokens[2].trim());

            SensorReadingRequestDto dto = new SensorReadingRequestDto(temp, vib, hours);
            if (tokens.length >= 4 && !tokens[3].trim().isEmpty()) {
                dto.setStrategyName(tokens[3].trim());
            }
            return dto;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid numeric value in telemetry string: " + rawPayload, e);
        }
    }

    @Override
    public String getProtocolName() {
        return "Legacy Modbus CSV / Serial String";
    }
}
