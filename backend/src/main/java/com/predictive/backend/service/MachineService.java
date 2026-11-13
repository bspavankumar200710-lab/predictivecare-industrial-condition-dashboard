package com.predictive.backend.service;

import com.predictive.backend.dto.MachineDto;
import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.SensorReading;
import com.predictive.backend.entity.enums.MaintenanceStatus;
import com.predictive.backend.exception.ResourceNotFoundException;
import com.predictive.backend.repository.MachineRepository;
import com.predictive.backend.repository.MaintenanceRequestRepository;
import com.predictive.backend.repository.SensorReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MachineService {

    private final MachineRepository machineRepository;
    private final SensorReadingRepository sensorReadingRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;

    public MachineService(
            MachineRepository machineRepository,
            SensorReadingRepository sensorReadingRepository,
            MaintenanceRequestRepository maintenanceRequestRepository) {
        this.machineRepository = machineRepository;
        this.sensorReadingRepository = sensorReadingRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
    }

    public List<Machine> getAllMachines() {
        return machineRepository.findAll();
    }

    public Machine getMachineById(Long id) {
        return machineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Machine", "id", id));
    }

    public Machine addMachine(Machine machine) {
        if (machine.getMachineCode() != null && machineRepository.existsByMachineCode(machine.getMachineCode())) {
            throw new IllegalArgumentException("Machine code already exists: " + machine.getMachineCode());
        }
        if (machine.getStatus() == null || machine.getStatus().isBlank()) {
            machine.setStatus("Healthy");
        }
        return machineRepository.save(machine);
    }

    public Machine updateMachine(Long id, Machine updatedMachine) {
        Machine existingMachine = getMachineById(id);
        existingMachine.setMachineName(updatedMachine.getMachineName());
        existingMachine.setMachineCode(updatedMachine.getMachineCode());
        existingMachine.setMachineType(updatedMachine.getMachineType());
        existingMachine.setLocation(updatedMachine.getLocation());
        if (updatedMachine.getStatus() != null && !updatedMachine.getStatus().isBlank()) {
            existingMachine.setStatus(updatedMachine.getStatus());
        }
        if (updatedMachine.getInstallationDate() != null) {
            existingMachine.setInstallationDate(updatedMachine.getInstallationDate());
        }
        return machineRepository.save(existingMachine);
    }

    public void deleteMachine(Long id) {
        Machine machine = getMachineById(id);
        machineRepository.delete(machine);
    }

    public MachineDto toDto(Machine machine) {
        MachineDto dto = new MachineDto();
        dto.setId(machine.getId());
        dto.setMachineName(machine.getMachineName());
        dto.setMachineCode(machine.getMachineCode());
        dto.setMachineType(machine.getMachineType());
        dto.setLocation(machine.getLocation());
        dto.setStatus(machine.getStatus());
        dto.setInstallationDate(machine.getInstallationDate());
        dto.setCreatedAt(machine.getCreatedAt());

        // Attach latest health score if available
        List<SensorReading> readings = sensorReadingRepository.findByMachineId(machine.getId());
        if (!readings.isEmpty()) {
            dto.setLatestHealthScore(readings.get(readings.size() - 1).getHealthScore());
        }

        long activeRequests = maintenanceRequestRepository.findByMachineId(machine.getId()).stream()
                .filter(m -> m.getStatus() == MaintenanceStatus.PENDING || m.getStatus() == MaintenanceStatus.IN_PROGRESS)
                .count();
        dto.setActiveMaintenanceCount(activeRequests);

        return dto;
    }

    public List<MachineDto> getAllMachinesAsDto() {
        return getAllMachines().stream().map(this::toDto).collect(Collectors.toList());
    }
}
