-- ====================================================================
-- Database: predictive_maintenance
-- Table: maintenance_requests
-- Integration: Spring Boot Data JPA + MySQL
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
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
