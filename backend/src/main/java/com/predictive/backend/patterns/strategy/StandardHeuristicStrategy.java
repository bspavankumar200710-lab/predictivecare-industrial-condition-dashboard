package com.predictive.backend.patterns.strategy;

import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.SensorReading;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Strategy Pattern - Default Concrete Strategy: Standard Heuristic Formula
 * 
 * Implements the verified original project formula:
 *   temperatureScore = max(0, 100 - temperature)
 *   vibrationScore   = max(0, 100 - (vibration * 10))
 *   healthScore      = (temperatureScore + vibrationScore) / 2
 * 
 * Classification Thresholds:
 *   - Healthy: score >= 70.0
 *   - Warning: score >= 40.0 and < 70.0
 *   - Critical: score < 40.0
 */
@Component("standardStrategy")
@Primary
public class StandardHeuristicStrategy implements HealthCalculationStrategy {

    @Override
    public double calculateHealthScore(SensorReading reading, Machine machine) {
        double temp = reading.getTemperature();
        double vib = reading.getVibration();

        double temperatureScore = Math.max(0.0, 100.0 - temp);
        double vibrationScore = Math.max(0.0, 100.0 - (vib * 10.0));
        double healthScore = (temperatureScore + vibrationScore) / 2.0;

        return Math.round(healthScore * 100.0) / 100.0;
    }

    @Override
    public String getStrategyName() {
        return "Standard Heuristic Condition Strategy";
    }

    @Override
    public String getFormulaDescription() {
        return "healthScore = [max(0, 100 - temperature) + max(0, 100 - vibration * 10)] / 2";
    }
}
