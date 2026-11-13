package com.predictive.backend.controller;

import com.predictive.backend.dto.MaintenanceRequestDto;
import com.predictive.backend.service.MaintenanceRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceRequestController {

    private final MaintenanceRequestService maintenanceRequestService;

    public MaintenanceRequestController(MaintenanceRequestService maintenanceRequestService) {
        this.maintenanceRequestService = maintenanceRequestService;
    }

    // Get all maintenance requests
    @GetMapping
    public List<MaintenanceRequestDto> getAllRequests() {
        return maintenanceRequestService.getAllRequests();
    }

    // Get maintenance requests for a specific machine
    @GetMapping("/machine/{machineId}")
    public List<MaintenanceRequestDto> getRequestsByMachine(@PathVariable Long machineId) {
        return maintenanceRequestService.getRequestsByMachine(machineId);
    }

    // Get maintenance request by ID
    @GetMapping("/{id}")
    public MaintenanceRequestDto getRequestById(@PathVariable Long id) {
        return maintenanceRequestService.getRequestById(id);
    }

    // Create a new maintenance request
    @PostMapping
    public ResponseEntity<MaintenanceRequestDto> createRequest(@Valid @RequestBody MaintenanceRequestDto requestDto) {
        MaintenanceRequestDto created = maintenanceRequestService.createRequest(requestDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // Update maintenance request (status, technician, resolution notes)
    @PutMapping("/{id}")
    public MaintenanceRequestDto updateRequest(
            @PathVariable Long id,
            @RequestBody MaintenanceRequestDto requestDto) {
        return maintenanceRequestService.updateRequest(id, requestDto);
    }

    // Delete maintenance request
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRequest(@PathVariable Long id) {
        maintenanceRequestService.deleteRequest(id);
        return ResponseEntity.ok("Maintenance request deleted successfully");
    }
}
