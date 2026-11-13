package com.predictive.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class SensorReadingRequestDto {

    @NotNull(message = "Temperature reading is required")
    @PositiveOrZero(message = "Temperature must be positive or zero")
    private Double temperature;

    @NotNull(message = "Vibration reading is required")
    @PositiveOrZero(message = "Vibration must be positive or zero")
    private Double vibration;

    @NotNull(message = "Operating hours reading is required")
    @PositiveOrZero(message = "Operating hours must be positive or zero")
    private Double operatingHours;

    private String strategyName; // Optional override for Strategy Pattern demo

    public SensorReadingRequestDto() {
    }

    public SensorReadingRequestDto(Double temperature, Double vibration, Double operatingHours) {
        this.temperature = temperature;
        this.vibration = vibration;
        this.operatingHours = operatingHours;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getVibration() {
        return vibration;
    }

    public void setVibration(Double vibration) {
        this.vibration = vibration;
    }

    public Double getOperatingHours() {
        return operatingHours;
    }

    public void setOperatingHours(Double operatingHours) {
        this.operatingHours = operatingHours;
    }

    public String getStrategyName() {
        return strategyName;
    }

    public void setStrategyName(String strategyName) {
        this.strategyName = strategyName;
    }
}
