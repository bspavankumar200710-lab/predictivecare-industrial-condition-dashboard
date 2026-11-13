package com.predictive.backend.repository;

import com.predictive.backend.entity.MaintenanceRequest;
import com.predictive.backend.entity.enums.MaintenanceStatus;
import com.predictive.backend.entity.enums.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {

    List<MaintenanceRequest> findByMachineId(Long machineId);

    List<MaintenanceRequest> findByStatus(MaintenanceStatus status);

    List<MaintenanceRequest> findByPriority(Priority priority);

    long countByStatus(MaintenanceStatus status);
}
