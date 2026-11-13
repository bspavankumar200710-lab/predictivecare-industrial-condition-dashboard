-- Predictive Maintenance System Database Schema
-- Compatible with MySQL 8.0+

CREATE TABLE IF NOT EXISTS machines (
    machine_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    machine_name VARCHAR(100) NOT NULL,
    machine_code VARCHAR(50) NOT NULL UNIQUE,
    machine_type VARCHAR(50),
    location VARCHAR(100),
    status VARCHAR(30) DEFAULT 'Healthy',
    installation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensors (
    sensor_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    machine_id BIGINT NOT NULL,
    sensor_type VARCHAR(50) NOT NULL,
    threshold_value DOUBLE,
    unit VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sensor_machine FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    reading_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    machine_id BIGINT NOT NULL,
    sensor_id BIGINT,
    reading_value DOUBLE NOT NULL,
    temperature DOUBLE NOT NULL,
    vibration DOUBLE NOT NULL,
    operating_hours DOUBLE NOT NULL,
    health_score DOUBLE NOT NULL,
    severity_level VARCHAR(20) DEFAULT 'NORMAL',
    reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reading_machine FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE,
    CONSTRAINT fk_reading_sensor FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    machine_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    assigned_technician VARCHAR(100),
    scheduled_date DATE,
    completed_date TIMESTAMP NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_maintenance_machine FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
);
