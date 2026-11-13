package com.predictive.backend.patterns.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.predictive.backend.dto.SensorReadingRequestDto;
import org.springframework.stereotype.Component;

/**
 * Adapter Pattern - Concrete Adapter 2: Third-party Cloud IoT Telemetry (MQTT/HTTP JSON)
 * 
 * Adapts vendor payloads with disparate keys like:
 * { "telemetry": { "t_celsius": 72.4, "v_rms_mms": 5.1 }, "runtime_sec": 3600000 }
 */
@Component
public class ExternalIotJsonAdapter implements TelemetryAdapter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public SensorReadingRequestDto adapt(String rawPayload) {
        try {
            JsonNode root = objectMapper.readTree(rawPayload);

            double temp = 0.0;
            if (root.has("temperature")) {
                temp = root.get("temperature").asDouble();
            } else if (root.has("temp_c")) {
                temp = root.get("temp_c").asDouble();
            } else if (root.has("t_celsius")) {
                temp = root.get("t_celsius").asDouble();
            }

            double vib = 0.0;
            if (root.has("vibration")) {
                vib = root.get("vibration").asDouble();
            } else if (root.has("vib_mms")) {
                vib = root.get("vib_mms").asDouble();
            } else if (root.has("v_rms")) {
                vib = root.get("v_rms").asDouble();
            }

            double hours = 0.0;
            if (root.has("operatingHours")) {
                hours = root.get("operatingHours").asDouble();
            } else if (root.has("hours")) {
                hours = root.get("hours").asDouble();
            } else if (root.has("runtime_sec")) {
                hours = root.get("runtime_sec").asDouble() / 3600.0;
            }

            SensorReadingRequestDto dto = new SensorReadingRequestDto(temp, vib, hours);
            if (root.has("strategy")) {
                dto.setStrategyName(root.get("strategy").asText());
            }

            return dto;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to adapt external JSON payload: " + e.getMessage(), e);
        }
    }

    @Override
    public String getProtocolName() {
        return "Third-Party Cloud IoT JSON";
    }
}
