package com.predictive.backend.service;

import com.predictive.backend.dto.MaintenanceRequestDto;
import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.MaintenanceRequest;
import com.predictive.backend.entity.enums.MaintenanceStatus;
import com.predictive.backend.exception.ResourceNotFoundException;
import com.predictive.backend.repository.MachineRepository;
import com.predictive.backend.repository.MaintenanceRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MaintenanceRequestService {

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final MachineRepository machineRepository;

    public MaintenanceRequestService(
            MaintenanceRequestRepository maintenanceRequestRepository,
            MachineRepository machineRepository) {
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.machineRepository = machineRepository;
    }

    public List<MaintenanceRequestDto> getAllRequests() {
        return maintenanceRequestRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<MaintenanceRequestDto> getRequestsByMachine(Long machineId) {
        return maintenanceRequestRepository.findByMachineId(machineId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public MaintenanceRequestDto getRequestById(Long id) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", id));
        return toDto(request);
    }

    public MaintenanceRequestDto createRequest(MaintenanceRequestDto dto) {
        Machine machine = machineRepository.findById(dto.getMachineId())
                .orElseThrow(() -> new ResourceNotFoundException("Machine", "id", dto.getMachineId()));

        MaintenanceRequest request = new MaintenanceRequest();
        request.setMachine(machine);
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setPriority(dto.getPriority());
        request.setStatus(dto.getStatus() != null ? dto.getStatus() : MaintenanceStatus.PENDING);
        request.setAssignedTechnician(dto.getAssignedTechnician());
        request.setScheduledDate(dto.getScheduledDate());

        // Update machine status if high priority
        if (request.getStatus() == MaintenanceStatus.IN_PROGRESS) {
            machine.setStatus("Maintenance");
            machineRepository.save(machine);
        }

        MaintenanceRequest saved = maintenanceRequestRepository.save(request);
        return toDto(saved);
    }

    public MaintenanceRequestDto updateRequest(Long id, MaintenanceRequestDto dto) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", id));

        if (dto.getTitle() != null) request.setTitle(dto.getTitle());
        if (dto.getDescription() != null) request.setDescription(dto.getDescription());
        if (dto.getPriority() != null) request.setPriority(dto.getPriority());
        if (dto.getAssignedTechnician() != null) request.setAssignedTechnician(dto.getAssignedTechnician());
        if (dto.getScheduledDate() != null) request.setScheduledDate(dto.getScheduledDate());
        if (dto.getResolutionNotes() != null) request.setResolutionNotes(dto.getResolutionNotes());

        if (dto.getStatus() != null) {
            request.setStatus(dto.getStatus());
            if (dto.getStatus() == MaintenanceStatus.COMPLETED) {
                request.setCompletedDate(LocalDateTime.now());
                // When maintenance completes, check if machine status should return to Healthy
                Machine machine = request.getMachine();
                if ("Maintenance".equalsIgnoreCase(machine.getStatus())) {
                    machine.setStatus("Healthy");
                    machineRepository.save(machine);
                }
            } else if (dto.getStatus() == MaintenanceStatus.IN_PROGRESS) {
                request.getMachine().setStatus("Maintenance");
                machineRepository.save(request.getMachine());
            }
        }

        MaintenanceRequest updated = maintenanceRequestRepository.save(request);
        return toDto(updated);
    }

    public void deleteRequest(Long id) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", id));
        maintenanceRequestRepository.delete(request);
    }

    public MaintenanceRequestDto toDto(MaintenanceRequest request) {
        MaintenanceRequestDto dto = new MaintenanceRequestDto();
        dto.setId(request.getId());
        dto.setMachineId(request.getMachine().getId());
        dto.setMachineName(request.getMachine().getMachineName());
        dto.setMachineCode(request.getMachine().getMachineCode());
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setPriority(request.getPriority());
        dto.setStatus(request.getStatus());
        dto.setAssignedTechnician(request.getAssignedTechnician());
        dto.setScheduledDate(request.getScheduledDate());
        dto.setCompletedDate(request.getCompletedDate());
        dto.setResolutionNotes(request.getResolutionNotes());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }
}
