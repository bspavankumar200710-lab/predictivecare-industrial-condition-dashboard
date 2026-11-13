package com.predictive.backend.patterns.strategy;

import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.SensorReading;
import org.springframework.stereotype.Component;

/**
 * Strategy Concrete Implementation: Thermal-Centric Strategy
 * 
 * Calibrated for thermal systems, compressors, hydraulic power packs, and furnaces
 * where cooling failure and oil breakdown precede mechanical seizure.
 * 
 * Weights:
 * - 70% Temperature penalty
 * - 20% Vibration penalty
 * - 10% Operating hours penalty
 */
@Component("thermalStrategy")
public class ThermalCentricStrategy implements HealthCalculationStrategy {

    @Override
    public double calculateHealthScore(SensorReading reading, Machine machine) {
        double temp = reading.getTemperature();
        double vib = reading.getVibration();
        double hours = reading.getOperatingHours();

        double tempPenalty = 0.0;
        if (temp > 40.0) {
            tempPenalty = Math.min(100.0, ((temp - 40.0) / (80.0 - 40.0)) * 100.0);
        }

        double vibPenalty = 0.0;
        if (vib > 2.0) {
            vibPenalty = Math.min(100.0, ((vib - 2.0) / (7.0 - 2.0)) * 100.0);
        }

        double agingPenalty = Math.min(15.0, (hours / 1000.0) * 1.5);

        double compositePenalty = (0.70 * tempPenalty) + (0.20 * vibPenalty) + (0.10 * agingPenalty);
        double finalScore = Math.max(0.0, Math.min(100.0, 100.0 - compositePenalty));

        return Math.round(finalScore * 10.0) / 10.0;
    }

    @Override
    public String getStrategyName() {
        return "Thermal-Centric Heat Strategy";
    }

    @Override
    public String getFormulaDescription() {
        return "Score = 100 - [0.70 * TempPenalty(40-80°C) + 0.20 * VibPenalty(2.0-7.0 mm/s) + 0.10 * AgingPenalty]";
    }
}
