package com.predictive.backend.patterns.factory;

import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.Sensor;

/**
 * Factory Method Pattern - Abstract Creator
 * 
 * Declares the factory method createSensor() that returns a configured Sensor entity.
 * Subclasses override this method to instantiate sensors with specific types, units,
 * and calibrated threshold limits.
 */
public abstract class SensorFactory {

    /**
     * Factory Method
     */
    public abstract Sensor createSensor(Machine machine);

    /**
     * Factory method with custom threshold override
     */
    public abstract Sensor createSensor(Machine machine, Double customThreshold);
}
