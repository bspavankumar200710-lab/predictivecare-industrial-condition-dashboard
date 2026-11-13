package com.predictive.backend.controller;

import com.predictive.backend.dto.AlertDto;
import com.predictive.backend.dto.SensorReadingRequestDto;
import com.predictive.backend.dto.SensorReadingResponseDto;
import com.predictive.backend.entity.SensorReading;
import com.predictive.backend.service.SensorReadingService;
import com.predictive.backend.patterns.adapter.ExternalIotJsonAdapter;
import com.predictive.backend.patterns.adapter.LegacyModbusCsvAdapter;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
public class SensorReadingController {

    private final SensorReadingService sensorReadingService;
    private final LegacyModbusCsvAdapter modbusCsvAdapter;
    private final ExternalIotJsonAdapter iotJsonAdapter;

    public SensorReadingController(
            SensorReadingService sensorReadingService,
            LegacyModbusCsvAdapter modbusCsvAdapter,
            ExternalIotJsonAdapter iotJsonAdapter) {
        this.sensorReadingService = sensorReadingService;
        this.modbusCsvAdapter = modbusCsvAdapter;
        this.iotJsonAdapter = iotJsonAdapter;
    }

    // Get sensor readings for a machine
    @GetMapping("/{machineId}/readings")
    public List<SensorReading> getReadings(@PathVariable Long machineId) {
        return sensorReadingService.getReadingsByMachine(machineId);
    }

    // Get sensor readings as enriched DTOs
    @GetMapping("/{machineId}/readings/dto")
    public List<SensorReadingResponseDto> getReadingsDto(@PathVariable Long machineId) {
        return sensorReadingService.getReadingsDtoByMachine(machineId);
    }

    // Add a sensor reading using DTO with Strategy support
    @PostMapping("/{machineId}/readings")
    public ResponseEntity<SensorReading> addReading(
            @PathVariable Long machineId,
            @Valid @RequestBody SensorReadingRequestDto readingDto) {
        SensorReading saved = sensorReadingService.addReadingFromDto(machineId, readingDto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Ingest telemetry via Adapter Pattern (Legacy Modbus CSV register)
    @PostMapping("/{machineId}/readings/adapter/csv")
    public ResponseEntity<SensorReading> addReadingFromCsv(
            @PathVariable Long machineId,
            @RequestBody String rawCsv) {
        SensorReadingRequestDto dto = modbusCsvAdapter.adapt(rawCsv);
        SensorReading saved = sensorReadingService.addReadingFromDto(machineId, dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Ingest telemetry via Adapter Pattern (External IoT Cloud JSON)
    @PostMapping("/{machineId}/readings/adapter/iot-json")
    public ResponseEntity<SensorReading> addReadingFromIotJson(
            @PathVariable Long machineId,
            @RequestBody String rawJson) {
        SensorReadingRequestDto dto = iotJsonAdapter.adapt(rawJson);
        SensorReading saved = sensorReadingService.addReadingFromDto(machineId, dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Get active rule-based alerts across all machines
    @GetMapping("/alerts")
    public List<AlertDto> getActiveAlerts() {
        return sensorReadingService.getActiveAlerts();
    }
}
