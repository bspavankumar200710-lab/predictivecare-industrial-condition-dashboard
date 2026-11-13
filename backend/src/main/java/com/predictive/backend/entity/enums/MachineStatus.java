package com.predictive.backend.entity.enums;

public enum MachineStatus {
    HEALTHY,
    WARNING,
    CRITICAL,
    MAINTENANCE,
    DECOMMISSIONED;

    public static MachineStatus fromScore(double score) {
        if (score >= 70.0) return HEALTHY;
        if (score >= 40.0) return WARNING;
        return CRITICAL;
    }
}
