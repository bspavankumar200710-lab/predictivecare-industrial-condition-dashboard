package com.predictive.backend.patterns.strategy;

import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.SensorReading;
import org.springframework.stereotype.Component;

/**
 * Strategy Concrete Implementation: Multi-Factor Degradation Strategy
 * 
 * Condition assessment incorporating temperature, vibration, and operating hours:
 * - 45% Temperature penalty relative to industrial operating threshold (45°C - 85°C)
 * - 45% Vibration velocity penalty (1.8 mm/s - 7.1 mm/s)
 * - 10% Operating hours aging factor
 */
@Component("balancedStrategy")
public class BalancedIndustrialStrategy implements HealthCalculationStrategy {

    @Override
    public double calculateHealthScore(SensorReading reading, Machine machine) {
        double temp = reading.getTemperature();
        double vib = reading.getVibration();
        double hours = reading.getOperatingHours();

        // 1. Temperature Penalty (0 to 100)
        double tempPenalty = 0.0;
        if (temp > 45.0) {
            tempPenalty = Math.min(100.0, ((temp - 45.0) / (85.0 - 45.0)) * 100.0);
        }

        // 2. Vibration Penalty (0 to 100)
        double vibPenalty = 0.0;
        if (vib > 1.8) {
            vibPenalty = Math.min(100.0, ((vib - 1.8) / (7.1 - 1.8)) * 100.0);
        }

        // 3. Operating hours aging factor
        double agingPenalty = Math.min(15.0, (hours / 1000.0) * 1.5);

        double compositePenalty = (0.45 * tempPenalty) + (0.45 * vibPenalty) + (0.10 * agingPenalty);
        double finalScore = Math.max(0.0, Math.min(100.0, 100.0 - compositePenalty));

        return Math.round(finalScore * 10.0) / 10.0;
    }

    @Override
    public String getStrategyName() {
        return "Multi-Factor Weighted Strategy";
    }

    @Override
    public String getFormulaDescription() {
        return "Score = 100 - [0.45 * TempPenalty(45-85°C) + 0.45 * VibPenalty(1.8-7.1 mm/s) + 0.10 * AgingPenalty]";
    }
}
