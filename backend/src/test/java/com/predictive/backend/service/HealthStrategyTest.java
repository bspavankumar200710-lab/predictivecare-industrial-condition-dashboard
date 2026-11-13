package com.predictive.backend.service;

import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.SensorReading;
import com.predictive.backend.patterns.strategy.StandardHeuristicStrategy;
import com.predictive.backend.patterns.strategy.ThermalCentricStrategy;
import com.predictive.backend.patterns.strategy.VibrationCentricStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class HealthStrategyTest {

    private StandardHeuristicStrategy standardStrategy;
    private VibrationCentricStrategy vibrationStrategy;
    private ThermalCentricStrategy thermalStrategy;
    private Machine machine;

    @BeforeEach
    void setUp() {
        standardStrategy = new StandardHeuristicStrategy();
        vibrationStrategy = new VibrationCentricStrategy();
        thermalStrategy = new ThermalCentricStrategy();

        machine = new Machine();
        machine.setId(1L);
        machine.setMachineName("Centrifugal Slurry Pump");
        machine.setMachineType("Centrifugal Pump");
    }

    @Test
    @DisplayName("Verified Formula: temperatureScore = max(0, 100 - temp), vibrationScore = max(0, 100 - vib*10)")
    void testStandardHeuristicFormulaCalculation() {
        SensorReading reading = new SensorReading();
        reading.setTemperature(30.0);
        reading.setVibration(1.5);
        reading.setOperatingHours(500.0);

        // Expected:
        // tempScore = 100 - 30 = 70.0
        // vibScore = 100 - (1.5 * 10) = 85.0
        // healthScore = (70.0 + 85.0) / 2 = 77.5
        double score = standardStrategy.calculateHealthScore(reading, machine);
        assertEquals(77.5, score, 0.01, "Health score must exactly equal (70.0 + 85.0) / 2 = 77.5");
        assertTrue(score >= 70.0, "Score 77.5 must classify as Healthy (>= 70)");
    }

    @Test
    @DisplayName("Verified Thresholds: Healthy >= 70, Warning 40 to < 70, Critical < 40")
    void testStandardHeuristicThresholds() {
        // Warning scenario: Temp 60°C, Vib 3.0 mm/s
        // tempScore = 40.0, vibScore = 70.0 -> healthScore = 55.0
        SensorReading warningReading = new SensorReading();
        warningReading.setTemperature(60.0);
        warningReading.setVibration(3.0);
        double warningScore = standardStrategy.calculateHealthScore(warningReading, machine);
        assertEquals(55.0, warningScore, 0.01);
        assertTrue(warningScore >= 40.0 && warningScore < 70.0, "Score 55.0 must fall in Warning zone [40, 70)");

        // Critical scenario: Temp 80°C, Vib 7.0 mm/s
        // tempScore = 20.0, vibScore = 30.0 -> healthScore = 25.0
        SensorReading criticalReading = new SensorReading();
        criticalReading.setTemperature(80.0);
        criticalReading.setVibration(7.0);
        double criticalScore = standardStrategy.calculateHealthScore(criticalReading, machine);
        assertEquals(25.0, criticalScore, 0.01);
        assertTrue(criticalScore < 40.0, "Score 25.0 must fall in Critical zone (< 40)");
    }

    @Test
    @DisplayName("Boundary Conditions: max(0, ...) clamping on extreme values")
    void testExtremeValueClamping() {
        // When temp exceeds 100°C, tempScore clamps to 0
        // When vib exceeds 10 mm/s, vibScore clamps to 0
        SensorReading extremeReading = new SensorReading();
        extremeReading.setTemperature(125.0);
        extremeReading.setVibration(14.0);
        double score = standardStrategy.calculateHealthScore(extremeReading, machine);
        assertEquals(0.0, score, 0.01, "Extreme readings beyond scale must clamp to 0.0");
    }

    @Test
    @DisplayName("Vibration Strategy triggers heavy penalty on high rotational vibration")
    void testHighVibrationDegradation() {
        SensorReading reading = new SensorReading();
        reading.setTemperature(50.0);
        reading.setVibration(6.5);
        reading.setOperatingHours(3500.0);

        double score = vibrationStrategy.calculateHealthScore(reading, machine);
        assertTrue(score < 40.0, "Vibration > 6.5 mm/s must drive score into Critical (<40)");
    }

    @Test
    @DisplayName("Thermal Strategy triggers heavy penalty on excessive heat")
    void testThermalRunawayPenalty() {
        SensorReading reading = new SensorReading();
        reading.setTemperature(85.0);
        reading.setVibration(1.5);
        reading.setOperatingHours(1500.0);

        double score = thermalStrategy.calculateHealthScore(reading, machine);
        assertTrue(score < 50.0, "Temperature at 85°C should sharply penalize health under Thermal Strategy");
    }
}
