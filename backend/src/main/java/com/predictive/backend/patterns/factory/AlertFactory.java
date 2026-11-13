package com.predictive.backend.patterns.factory;

import com.predictive.backend.dto.AlertDto;
import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.SensorReading;
import org.springframework.stereotype.Component;

/**
 * Factory for creating rule-based industrial alerts with standardized severities.
 */
@Component
public class AlertFactory {

    public AlertDto createCriticalScoreAlert(Machine machine, double score) {
        return new AlertDto(
                machine.getId() + "-critical-score",
                machine.getId(),
                machine.getMachineName(),
                "CRITICAL",
                String.format("Critical health score (%.1f%%). Immediate inspection required under ISO 10816 standards.", score),
                "HEALTH_SCORE"
        );
    }

    public AlertDto createWarningScoreAlert(Machine machine, double score) {
        return new AlertDto(
                machine.getId() + "-warning-score",
                machine.getId(),
                machine.getMachineName(),
                "WARNING",
                String.format("Health score degraded to %.1f%%. Schedule preventive maintenance.", score),
                "HEALTH_SCORE"
        );
    }

    public AlertDto createThermalAlert(Machine machine, double temperature) {
        return new AlertDto(
                machine.getId() + "-temp-alert",
                machine.getId(),
                machine.getMachineName(),
                "WARNING",
                String.format("High temperature observed (%.1f°C). Exceeds thermal baseline 70°C.", temperature),
                "TEMPERATURE"
        );
    }

    public AlertDto createVibrationAlert(Machine machine, double vibration) {
        return new AlertDto(
                machine.getId() + "-vib-alert",
                machine.getId(),
                machine.getMachineName(),
                "CRITICAL",
                String.format("Excessive vibration detected (%.2f mm/s). Exceeds ISO threshold 5.0 mm/s.", vibration),
                "VIBRATION"
        );
    }
}
