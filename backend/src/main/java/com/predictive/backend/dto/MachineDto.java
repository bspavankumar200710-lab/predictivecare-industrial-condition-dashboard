package com.predictive.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MachineDto {

    private Long id;

    @NotBlank(message = "Machine name is required")
    private String machineName;

    @NotBlank(message = "Machine code is required")
    private String machineCode;

    private String machineType;
    private String location;
    private String status;
    private LocalDate installationDate;
    private LocalDateTime createdAt;
    private Double latestHealthScore;
    private Long activeMaintenanceCount;

    public MachineDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMachineName() {
        return machineName;
    }

    public void setMachineName(String machineName) {
        this.machineName = machineName;
    }

    public String getMachineCode() {
        return machineCode;
    }

    public void setMachineCode(String machineCode) {
        this.machineCode = machineCode;
    }

    public String getMachineType() {
        return machineType;
    }

    public void setMachineType(String machineType) {
        this.machineType = machineType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getInstallationDate() {
        return installationDate;
    }

    public void setInstallationDate(LocalDate installationDate) {
        this.installationDate = installationDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Double getLatestHealthScore() {
        return latestHealthScore;
    }

    public void setLatestHealthScore(Double latestHealthScore) {
        this.latestHealthScore = latestHealthScore;
    }

    public Long getActiveMaintenanceCount() {
        return activeMaintenanceCount;
    }

    public void setActiveMaintenanceCount(Long activeMaintenanceCount) {
        this.activeMaintenanceCount = activeMaintenanceCount;
    }
}
