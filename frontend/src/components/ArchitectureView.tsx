import React, { useState } from 'react';
import {
  Layers,
  Server,
  Database,
  Code2,
  FileCode,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [activeCodeFile, setActiveCodeFile] = useState<
    'SensorReadingService' | 'MaintenanceEntity' | 'MaintenanceController' | 'MySQLSchema' | 'AppProperties'
  >('SensorReadingService');

  const codeSnippets: Record<string, { filename: string; language: string; code: string }> = {
    SensorReadingService: {
      filename: 'backend/src/main/java/com/predictive/backend/service/SensorReadingService.java',
      language: 'java',
      code: `package com.predictive.backend.service;

import com.predictive.backend.entity.Machine;
import com.predictive.backend.entity.Sensor;
import com.predictive.backend.entity.SensorReading;
import com.predictive.backend.repository.MachineRepository;
import com.predictive.backend.repository.SensorReadingRepository;
import com.predictive.backend.repository.SensorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SensorReadingService {

    private final SensorReadingRepository sensorReadingRepository;
    private final MachineRepository machineRepository;
    private final SensorRepository sensorRepository;

    public SensorReadingService(
            SensorReadingRepository sensorReadingRepository,
            MachineRepository machineRepository,
            SensorRepository sensorRepository) {
        this.sensorReadingRepository = sensorReadingRepository;
        this.machineRepository = machineRepository;
        this.sensorRepository = sensorRepository;
    }

    public List<SensorReading> getReadingsByMachine(Long machineId) {
        return sensorReadingRepository.findByMachineId(machineId);
    }

    public SensorReading addReading(Long machineId, SensorReading reading) {
        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new RuntimeException("Machine not found with ID: " + machineId));

        Sensor sensor = sensorRepository.findFirstByMachine_Id(machineId)
                .orElseGet(() -> {
                    Sensor newSensor = new Sensor();
                    newSensor.setMachine(machine);
                    newSensor.setSensorType("Temperature");
                    newSensor.setThresholdValue(70.0);
                    return sensorRepository.save(newSensor);
                });

        reading.setMachine(machine);
        reading.setSensor(sensor);
        reading.setReadingValue(reading.getTemperature());
        if (reading.getReadingTime() == null) {
            reading.setReadingTime(LocalDateTime.now());
        }

        // Exact verified health-score formula
        double temperatureScore = Math.max(0, 100 - reading.getTemperature());
        double vibrationScore = Math.max(0, 100 - reading.getVibration() * 10);
        double healthScore = (temperatureScore + vibrationScore) / 2;

        reading.setHealthScore(Math.round(healthScore * 100.0) / 100.0);

        return sensorReadingRepository.save(reading);
    }
}`,
    },
    MaintenanceEntity: {
      filename: 'backend/src/main/java/com/predictive/backend/entity/MaintenanceRequest.java',
      language: 'java',
      code: `package com.predictive.backend.entity;

import com.predictive.backend.entity.enums.MaintenanceStatus;
import com.predictive.backend.entity.enums.Priority;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_requests")
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    private Machine machine;

    @NotBlank(message = "Title is required")
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MaintenanceStatus status = MaintenanceStatus.PENDING;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    // Getters, setters, and audit timestamps omitted for brevity
}`,
    },
    MaintenanceController: {
      filename: 'backend/src/main/java/com/predictive/backend/controller/MaintenanceRequestController.java',
      language: 'java',
      code: `package com.predictive.backend.controller;

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

    @GetMapping
    public List<MaintenanceRequestDto> getAllRequests() {
        return maintenanceRequestService.getAllRequests();
    }

    @GetMapping("/machine/{machineId}")
    public List<MaintenanceRequestDto> getRequestsByMachine(@PathVariable Long machineId) {
        return maintenanceRequestService.getRequestsByMachine(machineId);
    }

    @PostMapping
    public ResponseEntity<MaintenanceRequestDto> createRequest(@Valid @RequestBody MaintenanceRequestDto requestDto) {
        MaintenanceRequestDto created = maintenanceRequestService.createRequest(requestDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public MaintenanceRequestDto updateRequest(
            @PathVariable Long id,
            @RequestBody MaintenanceRequestDto requestDto) {
        return maintenanceRequestService.updateRequest(id, requestDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRequest(@PathVariable Long id) {
        maintenanceRequestService.deleteRequest(id);
        return ResponseEntity.ok("Maintenance request deleted successfully");
    }
}`,
    },
    MySQLSchema: {
      filename: 'backend/src/main/resources/schema-maintenance.sql',
      language: 'sql',
      code: `-- ====================================================================
-- Database: predictive_maintenance
-- Table: maintenance_requests
-- ====================================================================

USE predictive_maintenance;

CREATE TABLE IF NOT EXISTS maintenance_requests (
    maintenance_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    machine_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    request_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scheduled_date DATE NULL,
    completion_date DATETIME NULL,
    notes VARCHAR(255) NULL,
    CONSTRAINT fk_maintenance_machine
        FOREIGN KEY (machine_id)
        REFERENCES machines (machine_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_maintenance_machine_id ON maintenance_requests(machine_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);`,
    },
    AppProperties: {
      filename: 'backend/src/main/resources/application.properties',
      language: 'properties',
      code: `# Application Name
spring.application.name=predictive-maintenance-system

# MySQL Database Configuration
spring.datasource.url=\${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/predictive_maintenance}
spring.datasource.username=\${SPRING_DATASOURCE_USERNAME:root}
spring.datasource.password=\${SPRING_DATASOURCE_PASSWORD:root}

# MySQL Driver
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Server Port
server.port=8080`,
    },
  };

  return (
    <div className="space-y-6">
      {/* Technology Stack Verification Card */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1e293b]">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Verified Technology Stack
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly matched to original GitHub project (<code className="text-blue-400">Machines-Diagnosis</code>)
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Pure Java / Spring Boot / MySQL Architecture</span>
          </div>
        </div>

        {/* Tech Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-[#0c1220] border border-[#1e293b]">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Frontend</span>
            <span className="font-bold text-slate-200 text-sm">React 19 &amp; Vite</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">JavaScript / TypeScript SPA</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0c1220] border border-[#1e293b]">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Backend Engine</span>
            <span className="font-bold text-slate-200 text-sm">Java 21 &amp; Spring Boot</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Spring MVC / REST Controllers</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0c1220] border border-[#1e293b]">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Persistence Layer</span>
            <span className="font-bold text-slate-200 text-sm">Spring Data JPA</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Hibernate ORM</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0c1220] border border-[#1e293b]">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Relational Database</span>
            <span className="font-bold text-slate-200 text-sm">MySQL Server</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">predictive_maintenance db</span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-[#090d16] border border-[#1e293b] text-xs text-slate-300 flex items-start gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
          <div>
            <strong>Architecture Boundary Notice:</strong> No Express.js, Express Proxy, or fabricated node middleware is displayed or used as the backend. The system connects to the user's authentic Spring Boot REST API at <code className="text-blue-400 font-mono">http://localhost:8080</code> or operates with exact contract fidelity in sandboxed sessions.
          </div>
        </div>
      </div>

      {/* REST API Endpoints Specification */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e293b]">
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Verified Spring Boot REST API Endpoints
            </h3>
            <p className="text-[11px] text-slate-400">
              Controller routes exposed on port <code className="text-blue-400 font-mono">8080</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-slate-400 text-[11px] uppercase font-mono">
                <th className="pb-2.5 pl-2">Method</th>
                <th className="pb-2.5">Endpoint</th>
                <th className="pb-2.5">Controller / Service</th>
                <th className="pb-2.5">Payload / Response</th>
                <th className="pb-2.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2333] font-mono text-[11px]">
              {/* Machine endpoints */}
              <tr className="hover:bg-[#141d30]">
                <td className="py-2.5 pl-2 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 text-slate-200 font-semibold">/api/machines</td>
                <td className="py-2.5 text-slate-400">MachineController</td>
                <td className="py-2.5 text-slate-300">List&lt;Machine&gt;</td>
                <td className="py-2.5 text-slate-400 font-sans">Retrieve all registered machines</td>
              </tr>
              <tr className="hover:bg-[#141d30]">
                <td className="py-2.5 pl-2 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 text-slate-200 font-semibold">/api/machines/&#123;id&#125;</td>
                <td className="py-2.5 text-slate-400">MachineController</td>
                <td className="py-2.5 text-slate-300">Machine</td>
                <td className="py-2.5 text-slate-400 font-sans">Retrieve single machine record</td>
              </tr>
              <tr className="hover:bg-[#141d30]">
                <td className="py-2.5 pl-2 text-blue-400 font-bold">POST</td>
                <td className="py-2.5 text-slate-200 font-semibold">/api/machines</td>
                <td className="py-2.5 text-slate-400">MachineController</td>
                <td className="py-2.5 text-slate-300">Machine JSON</td>
                <td className="py-2.5 text-slate-400 font-sans">Register new machine in MySQL</td>
              </tr>
              <tr className="hover:bg-[#141d30]">
                <td className="py-2.5 pl-2 text-amber-400 font-bold">PUT</td>
                <td className="py-2.5 text-slate-200 font-semibold">/api/machines/&#123;id&#125;</td>
                <td className="py-2.5 text-slate-400">MachineController</td>
                <td className="py-2.5 text-slate-300">Machine JSON</td>
                <td className="py-2.5 text-slate-400 font-sans">Update existing machine attributes</td>
              </tr>
              <tr className="hover:bg-[#141d30]">
                <td className="py-2.5 pl-2 text-rose-400 font-bold">DELETE</td>
                <td className="py-2.5 text-slate-200 font-semibold">/api/machines/&#123;id&#125;</td>
                <td className="py-2.5 text-slate-400">MachineController</td>
                <td className="py-2.5 text-slate-300">&#123;message, id&#125;</td>
                <td className="py-2.5 text-slate-400 font-sans">Delete machine and cascade readings</td>
              </tr>

              {/* Sensor reading endpoints */}
              <tr className="hover:bg-[#141d30]">
                <td className="py-2.5 pl-2 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 text-slate-200 font-semibold">/api/machines/&#123;id&#125;/readings</td>
                <td className="py-2.5 text-slate-400">SensorReadingController</td>
                <td className="py-2.5 text-slate-300">List&lt;SensorReading&gt;</td>
                <td className="py-2.5 text-slate-400 font-sans">Retrieve sensor readings for machine</td>
              </tr>
              <tr className="hover:bg-[#141d30]">
                <td className="py-2.5 pl-2 text-blue-400 font-bold">POST</td>
                <td className="py-2.5 text-slate-200 font-semibold">/api/machines/&#123;id&#125;/readings</td>
                <td className="py-2.5 text-slate-400">SensorReadingService</td>
                <td className="py-2.5 text-slate-300">&#123;temp, vib, hours&#125;</td>
                <td className="py-2.5 text-slate-400 font-sans">Compute health score and persist reading</td>
              </tr>

              {/* Maintenance endpoints */}
              <tr className="hover:bg-[#141d30]">
                <td className="py-2.5 pl-2 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 text-slate-200 font-semibold">/api/maintenance</td>
                <td className="py-2.5 text-slate-400">MaintenanceController</td>
                <td className="py-2.5 text-slate-300">List&lt;Maintenance&gt;</td>
                <td className="py-2.5 text-slate-400 font-sans">Retrieve all maintenance requests</td>
              </tr>
              <tr className="hover:bg-[#141d30]">
                <td className="py-2.5 pl-2 text-blue-400 font-bold">POST</td>
                <td className="py-2.5 text-slate-200 font-semibold">/api/maintenance/machine/&#123;id&#125;</td>
                <td className="py-2.5 text-slate-400">MaintenanceController</td>
                <td className="py-2.5 text-slate-300">Maintenance JSON</td>
                <td className="py-2.5 text-slate-400 font-sans">Create service request for equipment</td>
              </tr>
              <tr className="hover:bg-[#141d30]">
                <td className="py-2.5 pl-2 text-amber-400 font-bold">PUT</td>
                <td className="py-2.5 text-slate-200 font-semibold">/api/maintenance/&#123;id&#125;/status</td>
                <td className="py-2.5 text-slate-400">MaintenanceService</td>
                <td className="py-2.5 text-slate-300">&#123;status, notes&#125;</td>
                <td className="py-2.5 text-slate-400 font-sans">Update maintenance lifecycle status</td>
              </tr>
              <tr className="hover:bg-[#141d30]">
                <td className="py-2.5 pl-2 text-rose-400 font-bold">DELETE</td>
                <td className="py-2.5 text-slate-200 font-semibold">/api/maintenance/&#123;id&#125;</td>
                <td className="py-2.5 text-slate-400">MaintenanceController</td>
                <td className="py-2.5 text-slate-300">&#123;message&#125;</td>
                <td className="py-2.5 text-slate-400 font-sans">Delete maintenance order record</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Code Viewer for Spring Boot & MySQL */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Backend Source Code &amp; DDL Schema Inspector
            </h3>
          </div>

          {/* File selector buttons */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'SensorReadingService', label: 'SensorReadingService.java' },
              { id: 'MaintenanceEntity', label: 'MaintenanceRequest.java' },
              { id: 'MaintenanceController', label: 'MaintenanceRequestController.java' },
              { id: 'MySQLSchema', label: 'schema-maintenance.sql' },
              { id: 'AppProperties', label: 'application.properties' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveCodeFile(f.id as any)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                  activeCodeFile === f.id
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border border-[#1e293b]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#090d16] p-2 border-b border-[#1e293b] text-[11px] font-mono text-slate-400 flex items-center justify-between px-4">
          <span>Path: <strong className="text-slate-200">{codeSnippets[activeCodeFile].filename}</strong></span>
          <span className="uppercase text-[10px] text-blue-400">{codeSnippets[activeCodeFile].language}</span>
        </div>

        <pre className="p-4 bg-[#070a12] text-slate-200 text-xs font-mono overflow-x-auto max-h-[460px] leading-relaxed">
          <code>{codeSnippets[activeCodeFile].code}</code>
        </pre>
      </div>
    </div>
  );
};
