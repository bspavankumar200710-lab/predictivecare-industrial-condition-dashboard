package com.predictive.backend.patterns;

import com.predictive.backend.dto.SensorReadingRequestDto;
import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.Sensor;
import com.predictive.backend.patterns.adapter.ExternalIotJsonAdapter;
import com.predictive.backend.patterns.adapter.LegacyModbusCsvAdapter;
import com.predictive.backend.patterns.factory.TemperatureSensorFactory;
import com.predictive.backend.patterns.factory.VibrationSensorFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AdapterAndFactoryTest {

    @Test
    @DisplayName("Test LegacyModbusCsvAdapter parses comma-delimited telemetry")
    void testLegacyCsvAdapter() {
        LegacyModbusCsvAdapter adapter = new LegacyModbusCsvAdapter();
        String sampleCsv = "62.4, 3.8, 1420.0, vibration";

        SensorReadingRequestDto dto = adapter.adapt(sampleCsv);

        assertEquals(62.4, dto.getTemperature());
        assertEquals(3.8, dto.getVibration());
        assertEquals(1420.0, dto.getOperatingHours());
        assertEquals("vibration", dto.getStrategyName());
    }

    @Test
    @DisplayName("Test ExternalIotJsonAdapter adapts third-party JSON formats")
    void testIotJsonAdapter() {
        ExternalIotJsonAdapter adapter = new ExternalIotJsonAdapter();
        String json = "{\"t_celsius\": 78.5, \"vib_mms\": 4.9, \"runtime_sec\": 7200000}";

        SensorReadingRequestDto dto = adapter.adapt(json);

        assertEquals(78.5, dto.getTemperature());
        assertEquals(4.9, dto.getVibration());
        assertEquals(2000.0, dto.getOperatingHours()); // 7200000 sec / 3600 = 2000 hrs
    }

    @Test
    @DisplayName("Test SensorFactory generates calibrated sensor entities with units")
    void testSensorFactoryMethod() {
        Machine machine = new Machine();
        machine.setId(10L);
        machine.setMachineName("Compressor Unit 1");

        VibrationSensorFactory vibFactory = new VibrationSensorFactory();
        Sensor vibSensor = vibFactory.createSensor(machine);

        assertEquals("VIBRATION", vibSensor.getSensorType());
        assertEquals("mm/s", vibSensor.getUnit());
        assertEquals(4.5, vibSensor.getThresholdValue());
        assertEquals(machine, vibSensor.getMachine());

        TemperatureSensorFactory tempFactory = new TemperatureSensorFactory();
        Sensor tempSensor = tempFactory.createSensor(machine);
        assertEquals("TEMPERATURE", tempSensor.getSensorType());
        assertEquals("°C", tempSensor.getUnit());
        assertEquals(75.0, tempSensor.getThresholdValue());
    }
}
