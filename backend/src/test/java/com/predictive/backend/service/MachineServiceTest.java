package com.predictive.backend.service;

import com.predictive.backend.entity.Machine;
import com.predictive.backend.exception.ResourceNotFoundException;
import com.predictive.backend.repository.MachineRepository;
import com.predictive.backend.repository.MaintenanceRequestRepository;
import com.predictive.backend.repository.SensorReadingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MachineServiceTest {

    @Mock
    private MachineRepository machineRepository;

    @Mock
    private SensorReadingRepository sensorReadingRepository;

    @Mock
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @InjectMocks
    private MachineService machineService;

    private Machine testMachine;

    @BeforeEach
    void setUp() {
        testMachine = new Machine();
        testMachine.setId(1L);
        testMachine.setMachineName("Hydraulic Press Unit");
        testMachine.setMachineCode("PRESS-101");
        testMachine.setMachineType("Hydraulic Press");
        testMachine.setLocation("Stamping Hall Bay 2");
        testMachine.setStatus("Healthy");
        testMachine.setInstallationDate(LocalDate.of(2023, 3, 15));
    }

    @Test
    @DisplayName("CRUD Test: Get all machines")
    void testGetAllMachines() {
        when(machineRepository.findAll()).thenReturn(Arrays.asList(testMachine));

        List<Machine> result = machineService.getAllMachines();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("PRESS-101", result.get(0).getMachineCode());
        verify(machineRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("CRUD Test: Get machine by ID - success")
    void testGetMachineByIdSuccess() {
        when(machineRepository.findById(1L)).thenReturn(Optional.of(testMachine));

        Machine result = machineService.getMachineById(1L);

        assertNotNull(result);
        assertEquals("Hydraulic Press Unit", result.getMachineName());
        verify(machineRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("CRUD Test: Get machine by ID - not found throws ResourceNotFoundException")
    void testGetMachineByIdNotFound() {
        when(machineRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> machineService.getMachineById(99L));
        verify(machineRepository, times(1)).findById(99L);
    }

    @Test
    @DisplayName("CRUD Test: Add new machine with unique code")
    void testAddMachine() {
        when(machineRepository.existsByMachineCode("PRESS-101")).thenReturn(false);
        when(machineRepository.save(any(Machine.class))).thenReturn(testMachine);

        Machine saved = machineService.addMachine(testMachine);

        assertNotNull(saved);
        assertEquals("PRESS-101", saved.getMachineCode());
        verify(machineRepository, times(1)).save(testMachine);
    }

    @Test
    @DisplayName("CRUD Test: Add machine with duplicate code throws IllegalArgumentException")
    void testAddMachineDuplicateCode() {
        when(machineRepository.existsByMachineCode("PRESS-101")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> machineService.addMachine(testMachine));
        verify(machineRepository, never()).save(any(Machine.class));
    }

    @Test
    @DisplayName("CRUD Test: Update existing machine")
    void testUpdateMachine() {
        Machine updatedInfo = new Machine();
        updatedInfo.setMachineName("Updated Press Unit");
        updatedInfo.setMachineCode("PRESS-101");
        updatedInfo.setMachineType("Hydraulic Press");
        updatedInfo.setLocation("Bay 3");
        updatedInfo.setStatus("Warning");
        updatedInfo.setInstallationDate(LocalDate.of(2023, 3, 15));

        when(machineRepository.findById(1L)).thenReturn(Optional.of(testMachine));
        when(machineRepository.save(any(Machine.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Machine result = machineService.updateMachine(1L, updatedInfo);

        assertNotNull(result);
        assertEquals("Updated Press Unit", result.getMachineName());
        assertEquals("Bay 3", result.getLocation());
        assertEquals("Warning", result.getStatus());
        verify(machineRepository, times(1)).save(testMachine);
    }

    @Test
    @DisplayName("CRUD Test: Delete machine")
    void testDeleteMachine() {
        when(machineRepository.findById(1L)).thenReturn(Optional.of(testMachine));
        doNothing().when(machineRepository).delete(testMachine);

        machineService.deleteMachine(1L);

        verify(machineRepository, times(1)).findById(1L);
        verify(machineRepository, times(1)).delete(testMachine);
    }
}
