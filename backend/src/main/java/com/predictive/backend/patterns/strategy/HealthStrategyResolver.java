package com.predictive.backend.patterns.strategy;

import com.predictive.backend.entity.Machine;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Strategy Context / Resolver
 * 
 * Selects the appropriate HealthCalculationStrategy implementation based on
 * machine profile or runtime request parameters.
 * Defaults to StandardHeuristicStrategy which implements the verified formula.
 */
@Service
public class HealthStrategyResolver {

    private final Map<String, HealthCalculationStrategy> strategies;
    private final StandardHeuristicStrategy defaultStrategy;

    public HealthStrategyResolver(
            Map<String, HealthCalculationStrategy> strategies,
            StandardHeuristicStrategy defaultStrategy) {
        this.strategies = strategies;
        this.defaultStrategy = defaultStrategy;
    }

    public HealthCalculationStrategy resolveByKey(String strategyKey) {
        if (strategyKey == null || strategyKey.isBlank()) {
            return defaultStrategy;
        }
        String beanName = strategyKey.toLowerCase() + "Strategy";
        return strategies.getOrDefault(beanName, defaultStrategy);
    }

    public HealthCalculationStrategy resolveForMachine(Machine machine) {
        if (machine == null || machine.getMachineType() == null) {
            return defaultStrategy;
        }
        String type = machine.getMachineType().toLowerCase();
        if (type.contains("pump") || type.contains("fan") || type.contains("spindle") || type.contains("rotary")) {
            return strategies.getOrDefault("vibrationStrategy", defaultStrategy);
        } else if (type.contains("compressor") || type.contains("furnace") || type.contains("hydraulic") || type.contains("boiler")) {
            return strategies.getOrDefault("thermalStrategy", defaultStrategy);
        }
        return defaultStrategy;
    }

    public Map<String, HealthCalculationStrategy> getAllStrategies() {
        return strategies;
    }
}
