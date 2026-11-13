package com.predictive.backend.dto;

public class AlertDto {
    private String id;
    private Long machineId;
    private String machineName;
    private String severity; // INFO, WARNING, CRITICAL
    private String message;
    private String alertType; // HEALTH_SCORE, TEMPERATURE, VIBRATION

    public AlertDto() {
    }

    public AlertDto(String id, Long machineId, String machineName, String severity, String message, String alertType) {
        this.id = id;
        this.machineId = machineId;
        this.machineName = machineName;
        this.severity = severity;
        this.message = message;
        this.alertType = alertType;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getMachineId() {
        return machineId;
    }

    public void setMachineId(Long machineId) {
        this.machineId = machineId;
    }

    public String getMachineName() {
        return machineName;
    }

    public void setMachineName(String machineName) {
        this.machineName = machineName;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAlertType() {
        return alertType;
    }

    public void setAlertType(String alertType) {
        this.alertType = alertType;
    }
}
