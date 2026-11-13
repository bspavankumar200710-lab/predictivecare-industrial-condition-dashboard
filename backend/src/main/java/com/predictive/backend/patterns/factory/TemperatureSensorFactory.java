package com.predictive.backend.patterns.factory;

import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.Sensor;
import com.predictive.backend.entity.enums.SensorType;
import org.springframework.stereotype.Component;

/**
 * Concrete Creator for Temperature Sensors
 */
@Component
public class TemperatureSensorFactory extends SensorFactory {

    @Override
    public Sensor createSensor(Machine machine) {
        return createSensor(machine, SensorType.TEMPERATURE.getDefaultThreshold());
    }

    @Override
    public Sensor createSensor(Machine machine, Double customThreshold) {
        Sensor sensor = new Sensor();
        sensor.setMachine(machine);
        sensor.setSensorType(SensorType.TEMPERATURE.name());
        sensor.setUnit(SensorType.TEMPERATURE.getDefaultUnit());
        sensor.setThresholdValue(customThreshold != null ? customThreshold : SensorType.TEMPERATURE.getDefaultThreshold());
        return sensor;
    }
}
