package com.predictive.backend.service;

import com.predictive.backend.dto.MaintenanceRequestDto;
import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.MaintenanceRequest;
import com.predictive.backend.entity.enums.MaintenanceStatus;
import com.predictive.backend.entity.enums.Priority;
import com.predictive.backend.exception.ResourceNotFoundException;
import com.predictive.backend.repository.MachineRepository;
import com.predictive.backend.repository.MaintenanceRequestRepository;
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
class MaintenanceRequestServiceTest {

    @Mock
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @Mock
    private MachineRepository machineRepository;

    @InjectMocks
    private MaintenanceRequestService maintenanceRequestService;

    private Machine testMachine;
    private MaintenanceRequest testRequest;

    @BeforeEach
    void setUp() {
        testMachine = new Machine();
        testMachine.setId(1L);
        testMachine.setMachineName("CNC Milling Spindle");
        testMachine.setMachineCode("CNC-01");

        testRequest = new MaintenanceRequest();
        testRequest.setId(100L);
        testRequest.setMachine(testMachine);
        testRequest.setTitle("Bearing Lubrication Check");
        testRequest.setDescription("Perform routine spindle bearing check");
        testRequest.setPriority(Priority.HIGH);
        testRequest.setStatus(MaintenanceStatus.PENDING);
        testRequest.setScheduledDate(LocalDate.now().plusDays(2));
    }

    @Test
    @DisplayName("Maintenance Test: Create new service request")
    void testCreateRequest() {
        MaintenanceRequestDto inputDto = new MaintenanceRequestDto();
        inputDto.setMachineId(1L);
        inputDto.setTitle("Bearing Lubrication Check");
        inputDto.setDescription("Perform routine spindle bearing check");
        inputDto.setPriority(Priority.HIGH);
        inputDto.setScheduledDate(LocalDate.now().plusDays(2));

        when(machineRepository.findById(1L)).thenReturn(Optional.of(testMachine));
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenAnswer(inv -> {
            MaintenanceRequest req = inv.getArgument(0);
            req.setId(100L);
            return req;
        });

        MaintenanceRequestDto created = maintenanceRequestService.createRequest(inputDto);

        assertNotNull(created);
        assertEquals("Bearing Lubrication Check", created.getTitle());
        assertEquals(MaintenanceStatus.PENDING, created.getStatus());
        assertEquals(Priority.HIGH, created.getPriority());
        verify(maintenanceRequestRepository, times(1)).save(any(MaintenanceRequest.class));
    }

    @Test
    @DisplayName("Maintenance Test: Update status to IN_PROGRESS and COMPLETED")
    void testUpdateStatus() {
        when(maintenanceRequestRepository.findById(100L)).thenReturn(Optional.of(testRequest));
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        MaintenanceRequestDto updateDto = new MaintenanceRequestDto();
        updateDto.setStatus(MaintenanceStatus.COMPLETED);
        updateDto.setResolutionNotes("Replaced ball bearings and replenished synthetic grease.");

        MaintenanceRequestDto updated = maintenanceRequestService.updateRequest(100L, updateDto);

        assertNotNull(updated);
        assertEquals(MaintenanceStatus.COMPLETED, updated.getStatus());
        assertEquals("Replaced ball bearings and replenished synthetic grease.", updated.getResolutionNotes());
        assertNotNull(updated.getCompletedDate());
        verify(maintenanceRequestRepository, times(1)).save(testRequest);
    }

    @Test
    @DisplayName("Maintenance Test: Get requests by machine ID")
    void testGetRequestsByMachine() {
        when(maintenanceRequestRepository.findByMachineId(1L)).thenReturn(Arrays.asList(testRequest));

        List<MaintenanceRequestDto> results = maintenanceRequestService.getRequestsByMachine(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Bearing Lubrication Check", results.get(0).getTitle());
        verify(maintenanceRequestRepository, times(1)).findByMachineId(1L);
    }

    @Test
    @DisplayName("Maintenance Test: Delete maintenance request")
    void testDeleteRequest() {
        when(maintenanceRequestRepository.findById(100L)).thenReturn(Optional.of(testRequest));
        doNothing().when(maintenanceRequestRepository).delete(testRequest);

        maintenanceRequestService.deleteRequest(100L);

        verify(maintenanceRequestRepository, times(1)).findById(100L);
        verify(maintenanceRequestRepository, times(1)).delete(testRequest);
    }
}
