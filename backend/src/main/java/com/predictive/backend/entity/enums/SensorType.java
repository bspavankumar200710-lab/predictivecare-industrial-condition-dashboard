package com.predictive.backend.entity.enums;

public enum SensorType {
    TEMPERATURE("°C", 75.0),
    VIBRATION("mm/s", 4.5),
    PRESSURE("bar", 200.0),
    ACOUSTIC("dB", 85.0),
    RPM("rpm", 3600.0);

    private final String defaultUnit;
    private final double defaultThreshold;

    SensorType(String defaultUnit, double defaultThreshold) {
        this.defaultUnit = defaultUnit;
        this.defaultThreshold = defaultThreshold;
    }

    public String getDefaultUnit() {
        return defaultUnit;
    }

    public double getDefaultThreshold() {
        return defaultThreshold;
    }
}
