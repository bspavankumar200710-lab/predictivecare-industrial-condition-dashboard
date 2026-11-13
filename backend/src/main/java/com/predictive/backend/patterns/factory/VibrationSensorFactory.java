package com.predictive.backend.patterns.factory;

import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.Sensor;
import com.predictive.backend.entity.enums.SensorType;
import org.springframework.stereotype.Component;

/**
 * Concrete Creator for Vibration Sensors
 */
@Component
public class VibrationSensorFactory extends SensorFactory {

    @Override
    public Sensor createSensor(Machine machine) {
        return createSensor(machine, SensorType.VIBRATION.getDefaultThreshold());
    }

    @Override
    public Sensor createSensor(Machine machine, Double customThreshold) {
        Sensor sensor = new Sensor();
        sensor.setMachine(machine);
        sensor.setSensorType(SensorType.VIBRATION.name());
        sensor.setUnit(SensorType.VIBRATION.getDefaultUnit());
        sensor.setThresholdValue(customThreshold != null ? customThreshold : SensorType.VIBRATION.getDefaultThreshold());
        return sensor;
    }
}
