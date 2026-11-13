package com.predictive.backend.service;

import com.predictive.backend.dto.AlertDto;
import com.predictive.backend.dto.SensorReadingRequestDto;
import com.predictive.backend.dto.SensorReadingResponseDto;
import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.MaintenanceRequest;
import com.predictive.backend.entity.Sensor;
import com.predictive.backend.entity.SensorReading;
import com.predictive.backend.entity.enums.MachineStatus;
import com.predictive.backend.entity.enums.MaintenanceStatus;
import com.predictive.backend.entity.enums.Priority;
import com.predictive.backend.exception.ResourceNotFoundException;
import com.predictive.backend.patterns.factory.AlertFactory;
import com.predictive.backend.patterns.factory.TemperatureSensorFactory;
import com.predictive.backend.patterns.factory.VibrationSensorFactory;
import com.predictive.backend.patterns.strategy.HealthCalculationStrategy;
import com.predictive.backend.patterns.strategy.HealthStrategyResolver;
import com.predictive.backend.repository.MachineRepository;
import com.predictive.backend.repository.MaintenanceRequestRepository;
import com.predictive.backend.repository.SensorReadingRepository;
import com.predictive.backend.repository.SensorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SensorReadingService {

    private final SensorReadingRepository sensorReadingRepository;
    private final MachineRepository machineRepository;
    private final SensorRepository sensorRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final HealthStrategyResolver healthStrategyResolver;
    private final TemperatureSensorFactory temperatureSensorFactory;
    private final VibrationSensorFactory vibrationSensorFactory;
    private final AlertFactory alertFactory;

    public SensorReadingService(
            SensorReadingRepository sensorReadingRepository,
            MachineRepository machineRepository,
            SensorRepository sensorRepository,
            MaintenanceRequestRepository maintenanceRequestRepository,
            HealthStrategyResolver healthStrategyResolver,
            TemperatureSensorFactory temperatureSensorFactory,
            VibrationSensorFactory vibrationSensorFactory,
            AlertFactory alertFactory) {
        this.sensorReadingRepository = sensorReadingRepository;
        this.machineRepository = machineRepository;
        this.sensorRepository = sensorRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.healthStrategyResolver = healthStrategyResolver;
        this.temperatureSensorFactory = temperatureSensorFactory;
        this.vibrationSensorFactory = vibrationSensorFactory;
        this.alertFactory = alertFactory;
    }

    public List<SensorReading> getReadingsByMachine(Long machineId) {
        return sensorReadingRepository.findByMachineId(machineId);
    }

    public List<SensorReadingResponseDto> getReadingsDtoByMachine(Long machineId) {
        return getReadingsByMachine(machineId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Backward-compatible overload accepting raw SensorReading entity
     */
    public SensorReading addReading(Long machineId, SensorReading reading) {
        SensorReadingRequestDto dto = new SensorReadingRequestDto(
                reading.getTemperature(),
                reading.getVibration(),
                reading.getOperatingHours()
        );
        return addReadingFromDto(machineId, dto);
    }

    /**
     * Modern method utilizing Strategy and Factory Method patterns
     */
    public SensorReading addReadingFromDto(Long machineId, SensorReadingRequestDto dto) {
        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new ResourceNotFoundException("Machine", "id", machineId));

        // 1. Factory Method Pattern: Ensure calibrated sensors exist
        Sensor sensor = sensorRepository.findFirstByMachine_Id(machineId)
                .orElseGet(() -> {
                    // Use factory method to create calibrated sensor
                    Sensor newSensor = (dto.getVibration() > 3.0) 
                            ? vibrationSensorFactory.createSensor(machine)
                            : temperatureSensorFactory.createSensor(machine);
                    return sensorRepository.save(newSensor);
                });

        SensorReading reading = new SensorReading();
        reading.setMachine(machine);
        reading.setSensor(sensor);
        reading.setTemperature(dto.getTemperature());
        reading.setVibration(dto.getVibration());
        reading.setOperatingHours(dto.getOperatingHours());
        reading.setReadingValue(dto.getTemperature());
        reading.setReadingTime(LocalDateTime.now());

        // 2. Strategy Pattern: Select and calculate health score
        HealthCalculationStrategy strategy = dto.getStrategyName() != null && !dto.getStrategyName().isBlank()
                ? healthStrategyResolver.resolveByKey(dto.getStrategyName())
                : healthStrategyResolver.resolveForMachine(machine);

        double calculatedScore = strategy.calculateHealthScore(reading, machine);
        reading.setHealthScore(calculatedScore);

        // 3. Determine severity classification
        if (calculatedScore < 40.0) {
            reading.setSeverityLevel("CRITICAL");
        } else if (calculatedScore < 70.0) {
            reading.setSeverityLevel("WARNING");
        } else {
            reading.setSeverityLevel("NORMAL");
        }

        SensorReading savedReading = sensorReadingRepository.save(reading);

        // 4. Synchronize Machine Status in database
        if (!"Maintenance".equalsIgnoreCase(machine.getStatus())) {
            MachineStatus newStatus = MachineStatus.fromScore(calculatedScore);
            machine.setStatus(newStatus.name().substring(0, 1) + newStatus.name().substring(1).toLowerCase());
            machineRepository.save(machine);
        }

        // 5. Automated Maintenance Ticket Triggering on Critical Failure Risk
        if (calculatedScore < 40.0) {
            triggerAutomatedMaintenanceIfNeeded(machine, savedReading);
        }

        return savedReading;
    }

    private void triggerAutomatedMaintenanceIfNeeded(Machine machine, SensorReading reading) {
        // Check if there is already an open ticket
        boolean hasOpenTicket = maintenanceRequestRepository.findByMachineId(machine.getId()).stream()
                .anyMatch(req -> req.getStatus() == MaintenanceStatus.PENDING || req.getStatus() == MaintenanceStatus.IN_PROGRESS);

        if (!hasOpenTicket) {
            MaintenanceRequest autoTicket = new MaintenanceRequest(
                    machine,
                    "Automated Alert: Critical Health Score (" + reading.getHealthScore() + "%)",
                    String.format("Critical degradation detected under %s. Temp: %.1f°C, Vib: %.2f mm/s, Hours: %.0f hrs. Immediate inspection required.",
                            machine.getMachineType(), reading.getTemperature(), reading.getVibration(), reading.getOperatingHours()),
                    Priority.URGENT
            );
            autoTicket.setAssignedTechnician("Lead Predictive Reliability Engineer");
            maintenanceRequestRepository.save(autoTicket);
        }
    }

    public List<AlertDto> getActiveAlerts() {
        List<AlertDto> alerts = new ArrayList<>();
        List<Machine> machines = machineRepository.findAll();

        for (Machine machine : machines) {
            List<SensorReading> readings = sensorReadingRepository.findByMachineId(machine.getId());
            if (!readings.isEmpty()) {
                SensorReading latest = readings.get(readings.size() - 1);
                if (latest.getHealthScore() < 40.0) {
                    alerts.add(alertFactory.createCriticalScoreAlert(machine, latest.getHealthScore()));
                } else if (latest.getHealthScore() < 70.0) {
                    alerts.add(alertFactory.createWarningScoreAlert(machine, latest.getHealthScore()));
                }

                if (latest.getTemperature() >= 70.0) {
                    alerts.add(alertFactory.createThermalAlert(machine, latest.getTemperature()));
                }
                if (latest.getVibration() >= 5.0) {
                    alerts.add(alertFactory.createVibrationAlert(machine, latest.getVibration()));
                }
            }
        }
        return alerts;
    }

    public SensorReadingResponseDto toResponseDto(SensorReading reading) {
        SensorReadingResponseDto dto = new SensorReadingResponseDto();
        dto.setId(reading.getId());
        dto.setMachineId(reading.getMachine().getId());
        dto.setMachineName(reading.getMachine().getMachineName());
        if (reading.getSensor() != null) {
            dto.setSensorId(reading.getSensor().getId());
            dto.setSensorType(reading.getSensor().getSensorType());
        }
        dto.setReadingValue(reading.getReadingValue());
        dto.setTemperature(reading.getTemperature());
        dto.setVibration(reading.getVibration());
        dto.setOperatingHours(reading.getOperatingHours());
        dto.setHealthScore(reading.getHealthScore());
        dto.setSeverityLevel(reading.getSeverityLevel());
        dto.setReadingTime(reading.getReadingTime());
        return dto;
    }
}