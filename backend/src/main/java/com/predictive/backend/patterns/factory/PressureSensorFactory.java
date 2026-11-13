package com.predictive.backend.patterns.factory;

import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.Sensor;
import com.predictive.backend.entity.enums.SensorType;
import org.springframework.stereotype.Component;

/**
 * Concrete Creator for Pressure Sensors
 */
@Component
public class PressureSensorFactory extends SensorFactory {

    @Override
    public Sensor createSensor(Machine machine) {
        return createSensor(machine, SensorType.PRESSURE.getDefaultThreshold());
    }

    @Override
    public Sensor createSensor(Machine machine, Double customThreshold) {
        Sensor sensor = new Sensor();
        sensor.setMachine(machine);
        sensor.setSensorType(SensorType.PRESSURE.name());
        sensor.setUnit(SensorType.PRESSURE.getDefaultUnit());
        sensor.setThresholdValue(customThreshold != null ? customThreshold : SensorType.PRESSURE.getDefaultThreshold());
        return sensor;
    }
}
