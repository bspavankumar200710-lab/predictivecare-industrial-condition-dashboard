
package com.predictive.backend.controller;

import com.predictive.backend.dto.MachineDto;
import com.predictive.backend.entity.Machine;
import com.predictive.backend.service.MachineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
public class MachineController {

    private final MachineService machineService;

    public MachineController(MachineService machineService) {
        this.machineService = machineService;
    }

    // Get all machines as DTOs (avoids lazy-loading serialization errors)
    @GetMapping
    public List<MachineDto> getAllMachines() {
        return machineService.getAllMachinesAsDto();
    }

    // Get all machines with health scores and maintenance statistics
    @GetMapping("/overview")
    public List<MachineDto> getMachinesOverview() {
        return machineService.getAllMachinesAsDto();
    }

    // Get machine by ID
    @GetMapping("/{id}")
    public Machine getMachineById(@PathVariable Long id) {
        return machineService.getMachineById(id);
    }

    // Add new machine
    @PostMapping
    public ResponseEntity<Machine> addMachine(@Valid @RequestBody Machine machine) {
        Machine savedMachine = machineService.addMachine(machine);
        return new ResponseEntity<>(savedMachine, HttpStatus.CREATED);
    }

    // Update machine
    @PutMapping("/{id}")
    public Machine updateMachine(
            @PathVariable Long id,
            @Valid @RequestBody Machine machine) {
        return machineService.updateMachine(id, machine);
    }

    // Delete machine
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMachine(@PathVariable Long id) {
        machineService.deleteMachine(id);
        return ResponseEntity.ok("Machine deleted successfully");
    }
}
