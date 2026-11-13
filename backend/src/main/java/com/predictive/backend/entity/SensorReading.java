package com.predictive.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_readings")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reading_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    @JsonIgnoreProperties({"sensors", "readings", "maintenanceRequests"})
    private Machine machine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sensor_id")
    @JsonIgnoreProperties({"machine"})
    private Sensor sensor;

    @Column(name = "reading_value", nullable = false)
    private double readingValue;

    @PositiveOrZero(message = "Temperature must be zero or positive")
    @Column(name = "temperature", nullable = false)
    private double temperature;

    @PositiveOrZero(message = "Vibration must be zero or positive")
    @Column(name = "vibration", nullable = false)
    private double vibration;

    @PositiveOrZero(message = "Operating hours must be zero or positive")
    @Column(name = "operating_hours", nullable = false)
    private double operatingHours;

    @Column(name = "health_score", nullable = false)
    private double healthScore;

    @Column(name = "severity_level")
    private String severityLevel = "NORMAL";

    @Column(name = "reading_time")
    private LocalDateTime readingTime = LocalDateTime.now();

    public SensorReading() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Machine getMachine() {
        return machine;
    }

    public void setMachine(Machine machine) {
        this.machine = machine;
    }

    public Sensor getSensor() {
        return sensor;
    }

    public void setSensor(Sensor sensor) {
        this.sensor = sensor;
    }

    public double getReadingValue() {
        return readingValue;
    }

    public void setReadingValue(double readingValue) {
        this.readingValue = readingValue;
    }

    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public double getVibration() {
        return vibration;
    }

    public void setVibration(double vibration) {
        this.vibration = vibration;
    }

    public double getOperatingHours() {
        return operatingHours;
    }

    public void setOperatingHours(double operatingHours) {
        this.operatingHours = operatingHours;
    }

    public double getHealthScore() {
        return healthScore;
    }

    public void setHealthScore(double healthScore) {
        this.healthScore = healthScore;
    }

    public String getSeverityLevel() {
        return severityLevel;
    }

    public void setSeverityLevel(String severityLevel) {
        this.severityLevel = severityLevel;
    }

    public LocalDateTime getReadingTime() {
        return readingTime;
    }

    public void setReadingTime(LocalDateTime readingTime) {
        this.readingTime = readingTime;
    }
}
