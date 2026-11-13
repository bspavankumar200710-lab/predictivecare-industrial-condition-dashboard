package com.predictive.backend.patterns.strategy;

import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.SensorReading;

/**
 * Strategy Pattern - Behavioral Pattern Interface
 * 
 * Defines the family of health-score assessment algorithms.
 * Makes the scoring strategy interchangeable at runtime without modifying client code,
 * adhering to the Open/Closed Principle (OCP).
 */
public interface HealthCalculationStrategy {

    /**
     * Calculates a normalized health score (0.0 to 100.0) based on telemetry and equipment profile.
     * 
     * @param reading The telemetry reading containing temperature, vibration, and hours
     * @param machine The machine context (type, location, baseline)
     * @return Calculated health score between 0.0 and 100.0
     */
    double calculateHealthScore(SensorReading reading, Machine machine);

    /**
     * Human-readable name of the strategy.
     */
    String getStrategyName();

    /**
     * Technical justification and breakdown of the mathematical formula.
     */
    String getFormulaDescription();
}
