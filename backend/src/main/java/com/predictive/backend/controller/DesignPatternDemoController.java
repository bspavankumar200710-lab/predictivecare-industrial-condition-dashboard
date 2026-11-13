package com.predictive.backend.controller;

import com.predictive.backend.dto.ApiResponse;
import com.predictive.backend.dto.SensorReadingRequestDto;
import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.Sensor;
import com.predictive.backend.patterns.adapter.ExternalIotJsonAdapter;
import com.predictive.backend.patterns.adapter.LegacyModbusCsvAdapter;
import com.predictive.backend.patterns.factory.PressureSensorFactory;
import com.predictive.backend.patterns.factory.TemperatureSensorFactory;
import com.predictive.backend.patterns.factory.VibrationSensorFactory;
import com.predictive.backend.patterns.strategy.HealthCalculationStrategy;
import com.predictive.backend.patterns.strategy.HealthStrategyResolver;
import com.predictive.backend.service.MachineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/patterns")
public class DesignPatternDemoController {

    private final HealthStrategyResolver strategyResolver;
    private final LegacyModbusCsvAdapter modbusCsvAdapter;
    private final ExternalIotJsonAdapter iotJsonAdapter;
    private final TemperatureSensorFactory tempFactory;
    private final VibrationSensorFactory vibFactory;
    private final PressureSensorFactory pressureFactory;
    private final MachineService machineService;

    public DesignPatternDemoController(
            HealthStrategyResolver strategyResolver,
            LegacyModbusCsvAdapter modbusCsvAdapter,
            ExternalIotJsonAdapter iotJsonAdapter,
            TemperatureSensorFactory tempFactory,
            VibrationSensorFactory vibFactory,
            PressureSensorFactory pressureFactory,
            MachineService machineService) {
        this.strategyResolver = strategyResolver;
        this.modbusCsvAdapter = modbusCsvAdapter;
        this.iotJsonAdapter = iotJsonAdapter;
        this.tempFactory = tempFactory;
        this.vibFactory = vibFactory;
        this.pressureFactory = pressureFactory;
        this.machineService = machineService;
    }

    // 1. STRATEGY PATTERN: List all available strategies and formulas
    @GetMapping("/strategies")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStrategies() {
        Map<String, Object> result = new HashMap<>();
        Map<String, HealthCalculationStrategy> all = strategyResolver.getAllStrategies();
        Map<String, Object> details = new HashMap<>();

        all.forEach((key, strategy) -> {
            Map<String, String> info = new HashMap<>();
            info.put("name", strategy.getStrategyName());
            info.put("formula", strategy.getFormulaDescription());
            details.put(key, info);
        });

        result.put("pattern", "Strategy Pattern (Behavioral)");
        result.put("purpose", "Enables interchangeable health evaluation algorithms without modifying core domain service");
        result.put("strategies", details);

        return ResponseEntity.ok(ApiResponse.success("Strategy pattern registry retrieved", result));
    }

    // 2. ADAPTER PATTERN: Adapt legacy CSV string
    @PostMapping("/adapter/csv")
    public ResponseEntity<ApiResponse<SensorReadingRequestDto>> testCsvAdapter(@RequestBody String rawCsv) {
        SensorReadingRequestDto adapted = modbusCsvAdapter.adapt(rawCsv);
        return ResponseEntity.ok(ApiResponse.success("Successfully adapted Modbus CSV via Adapter Pattern", adapted));
    }

    // 2b. ADAPTER PATTERN: Adapt external JSON
    @PostMapping("/adapter/json")
    public ResponseEntity<ApiResponse<SensorReadingRequestDto>> testJsonAdapter(@RequestBody String rawJson) {
        SensorReadingRequestDto adapted = iotJsonAdapter.adapt(rawJson);
        return ResponseEntity.ok(ApiResponse.success("Successfully adapted IoT Cloud JSON via Adapter Pattern", adapted));
    }

    // 3. FACTORY METHOD PATTERN: Demonstrate sensor factory instantiation
    @PostMapping("/factory/sensor")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testSensorFactory(
            @RequestParam Long machineId,
            @RequestParam String type) {
        Machine machine = machineService.getMachineById(machineId);
        Sensor sensor;

        switch (type.toUpperCase()) {
            case "VIBRATION":
                sensor = vibFactory.createSensor(machine);
                break;
            case "PRESSURE":
                sensor = pressureFactory.createSensor(machine);
                break;
            case "TEMPERATURE":
            default:
                sensor = tempFactory.createSensor(machine);
                break;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("pattern", "Factory Method Pattern (Creational)");
        response.put("createdSensorType", sensor.getSensorType());
        response.put("defaultThreshold", sensor.getThresholdValue());
        response.put("unit", sensor.getUnit());
        response.put("associatedMachine", machine.getMachineName());

        return ResponseEntity.ok(ApiResponse.success("Sensor instantiated via Factory Method", response));
    }
}
