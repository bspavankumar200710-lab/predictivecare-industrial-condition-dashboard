package com.predictive.backend.patterns.adapter;

import com.predictive.backend.dto.SensorReadingRequestDto;

/**
 * Adapter Pattern - Target Interface
 * 
 * Defines the domain-specific contract required by the Predictive Maintenance System
 * for ingesting external device telemetry packets.
 */
public interface TelemetryAdapter {

    /**
     * Adapts raw external telemetry data into a standardized domain DTO.
     * 
     * @param rawPayload The external raw data string (e.g. CSV, XML, or vendor JSON)
     * @return Standardized SensorReadingRequestDto ready for service processing
     */
    SensorReadingRequestDto adapt(String rawPayload);

    /**
     * Protocol or vendor name supported by this adapter.
     */
    String getProtocolName();
}
