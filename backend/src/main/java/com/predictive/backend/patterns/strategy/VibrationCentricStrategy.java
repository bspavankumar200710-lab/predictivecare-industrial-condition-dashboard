package com.predictive.backend.patterns.strategy;

import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.SensorReading;
import org.springframework.stereotype.Component;

/**
 * Strategy Concrete Implementation: Vibration-Centric Strategy
 * 
 * Specifically calibrated for rotary machinery (pumps, blowers, CNC spindles, turbines)
 * where bearing spalling, unbalance, and misalignment manifest predominantly in vibration velocity.
 * 
 * Weights:
 * - 70% Vibration penalty
 * - 20% Temperature penalty
 * - 10% Operating hours penalty
 */
@Component("vibrationStrategy")
public class VibrationCentricStrategy implements HealthCalculationStrategy {

    @Override
    public double calculateHealthScore(SensorReading reading, Machine machine) {
        double temp = reading.getTemperature();
        double vib = reading.getVibration();
        double hours = reading.getOperatingHours();

        double vibPenalty = 0.0;
        if (vib > 1.5) {
            vibPenalty = Math.min(100.0, ((vib - 1.5) / (6.0 - 1.5)) * 100.0);
        }

        double tempPenalty = 0.0;
        if (temp > 50.0) {
            tempPenalty = Math.min(100.0, ((temp - 50.0) / (90.0 - 50.0)) * 100.0);
        }

        double agingPenalty = Math.min(15.0, (hours / 1000.0) * 1.5);

        double compositePenalty = (0.70 * vibPenalty) + (0.20 * tempPenalty) + (0.10 * agingPenalty);
        double finalScore = Math.max(0.0, Math.min(100.0, 100.0 - compositePenalty));

        return Math.round(finalScore * 10.0) / 10.0;
    }

    @Override
    public String getStrategyName() {
        return "Vibration-Centric Rotary Strategy";
    }

    @Override
    public String getFormulaDescription() {
        return "Score = 100 - [0.70 * VibPenalty(1.5-6.0 mm/s) + 0.20 * TempPenalty(50-90°C) + 0.10 * AgingPenalty]";
    }
}
