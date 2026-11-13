package com.predictive.backend.service;

import com.predictive.backend.dto.AlertDto;
import com.predictive.backend.dto.SensorReadingRequestDto;
import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.Sensor;
import com.predictive.backend.entity.SensorReading;
import com.predictive.backend.patterns.factory.AlertFactory;
import com.predictive.backend.patterns.factory.TemperatureSensorFactory;
import com.predictive.backend.patterns.factory.VibrationSensorFactory;
import com.predictive.backend.patterns.strategy.HealthStrategyResolver;
import com.predictive.backend.patterns.strategy.StandardHeuristicStrategy;
import com.predictive.backend.repository.MachineRepository;
import com.predictive.backend.repository.MaintenanceRequestRepository;
import com.predictive.backend.repository.SensorReadingRepository;
import com.predictive.backend.repository.SensorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SensorReadingServiceTest {

    @Mock
    private SensorReadingRepository sensorReadingRepository;

    @Mock
    private MachineRepository machineRepository;

    @Mock
    private SensorRepository sensorRepository;

    @Mock
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @Mock
    private HealthStrategyResolver healthStrategyResolver;

    @Mock
    private TemperatureSensorFactory temperatureSensorFactory;

    @Mock
    private VibrationSensorFactory vibrationSensorFactory;

    @Mock
    private AlertFactory alertFactory;

    @InjectMocks
    private SensorReadingService sensorReadingService;

    private Machine machine;
    private Sensor sensor;

    @BeforeEach
    void setUp() {
        machine = new Machine();
        machine.setId(1L);
        machine.setMachineName("Rotary Compressor");
        machine.setMachineCode("COMP-001");
        machine.setMachineType("Compressor");
        machine.setStatus("Healthy");

        sensor = new Sensor();
        sensor.setId(1L);
        sensor.setMachine(machine);
        sensor.setSensorType("Temperature");
        sensor.setThresholdValue(75.0);
    }

    @Test
    @DisplayName("Sensor Reading Test: Add reading calculates health score using Standard Strategy")
    void testAddReadingCalculatesHealthScore() {
        SensorReadingRequestDto dto = new SensorReadingRequestDto(40.0, 2.0, 1500.0);

        when(machineRepository.findById(1L)).thenReturn(Optional.of(machine));
        when(sensorRepository.findFirstByMachine_Id(1L)).thenReturn(Optional.of(sensor));
        when(healthStrategyResolver.resolveForMachine(machine)).thenReturn(new StandardHeuristicStrategy());
        when(sensorReadingRepository.save(any(SensorReading.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SensorReading saved = sensorReadingService.addReadingFromDto(1L, dto);

        assertNotNull(saved);
        assertEquals(40.0, saved.getTemperature());
        assertEquals(2.0, saved.getVibration());
        // (100 - 40) = 60; (100 - 2.0*10) = 80; (60 + 80)/2 = 70.0 (Healthy)
        assertEquals(70.0, saved.getHealthScore(), 0.01);
        assertEquals("NORMAL", saved.getSeverityLevel());
        verify(sensorReadingRepository, times(1)).save(any(SensorReading.class));
    }

    @Test
    @DisplayName("Sensor Reading Test: Factory Method creates new sensor when none exists")
    void testFactoryMethodInvokedWhenSensorNotFound() {
        SensorReadingRequestDto dto = new SensorReadingRequestDto(45.0, 1.2, 500.0);

        when(machineRepository.findById(1L)).thenReturn(Optional.of(machine));
        when(sensorRepository.findFirstByMachine_Id(1L)).thenReturn(Optional.empty());
        when(temperatureSensorFactory.createSensor(machine)).thenReturn(sensor);
        when(sensorRepository.save(any(Sensor.class))).thenReturn(sensor);
        when(healthStrategyResolver.resolveForMachine(machine)).thenReturn(new StandardHeuristicStrategy());
        when(sensorReadingRepository.save(any(SensorReading.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SensorReading saved = sensorReadingService.addReadingFromDto(1L, dto);

        assertNotNull(saved);
        verify(temperatureSensorFactory, times(1)).createSensor(machine);
        verify(sensorRepository, times(1)).save(sensor);
    }

    @Test
    @DisplayName("Sensor Reading Test: Synchronizes machine status to Warning on degraded reading")
    void testMachineStatusSynchronizedOnWarning() {
        // Temp 65°C, Vib 4.0 mm/s -> tempScore=35, vibScore=60 -> healthScore = 47.5 (Warning)
        SensorReadingRequestDto dto = new SensorReadingRequestDto(65.0, 4.0, 2000.0);

        when(machineRepository.findById(1L)).thenReturn(Optional.of(machine));
        when(sensorRepository.findFirstByMachine_Id(1L)).thenReturn(Optional.of(sensor));
        when(healthStrategyResolver.resolveForMachine(machine)).thenReturn(new StandardHeuristicStrategy());
        when(sensorReadingRepository.save(any(SensorReading.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SensorReading saved = sensorReadingService.addReadingFromDto(1L, dto);

        assertEquals(47.5, saved.getHealthScore(), 0.01);
        assertEquals("WARNING", saved.getSeverityLevel());
        verify(machineRepository, times(1)).save(machine);
        assertEquals("Warning", machine.getStatus());
    }

    @Test
    @DisplayName("Sensor Reading Test: Get readings by machine ID")
    void testGetReadingsByMachine() {
        SensorReading r1 = new SensorReading();
        r1.setId(10L);
        r1.setTemperature(35.0);
        r1.setVibration(1.1);

        when(sensorReadingRepository.findByMachineId(1L)).thenReturn(Arrays.asList(r1));

        List<SensorReading> result = sensorReadingService.getReadingsByMachine(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getId());
        verify(sensorReadingRepository, times(1)).findByMachineId(1L);
    }
}
