-- Seed Data for Predictive Maintenance System (MySQL)
-- No fabricated technicians or fake resolution notes

INSERT INTO machines (machine_id, machine_name, machine_code, machine_type, location, status, installation_date)
VALUES 
(1, 'Centrifugal Slurry Pump', 'PUMP-001', 'Centrifugal Pump', 'Bay 1 - Pumping Station', 'Healthy', '2023-01-15'),
(2, 'Rotary Screw Compressor', 'COMP-102', 'Compressor', 'Utility Room B', 'Warning', '2022-08-20'),
(3, 'CNC Vertical Milling Spindle', 'CNC-404', 'CNC Milling Machine', 'Precision Machining Hall', 'Critical', '2021-11-05'),
(4, 'Heavy Industrial Exhaust Blower', 'FAN-201', 'Ventilation Fan', 'Roof Exhaust Section C', 'Healthy', '2023-05-10'),
(5, 'Main Hydraulic Press Unit', 'PRESS-501', 'Hydraulic Press', 'Stamping Facility 2', 'Warning', '2020-03-12')
ON DUPLICATE KEY UPDATE machine_name = VALUES(machine_name);

INSERT INTO sensors (sensor_id, machine_id, sensor_type, threshold_value, unit)
VALUES
(1, 1, 'Vibration', 4.5, 'mm/s'),
(2, 1, 'Temperature', 75.0, '°C'),
(3, 2, 'Vibration', 5.0, 'mm/s'),
(4, 2, 'Temperature', 80.0, '°C'),
(5, 3, 'Vibration', 3.5, 'mm/s'),
(6, 3, 'Temperature', 70.0, '°C'),
(7, 4, 'Vibration', 4.0, 'mm/s'),
(8, 5, 'Temperature', 70.0, '°C')
ON DUPLICATE KEY UPDATE sensor_type = VALUES(sensor_type);

-- Calculated strictly via:
-- temperatureScore = max(0, 100 - temperature)
-- vibrationScore = max(0, 100 - vibration * 10)
-- healthScore = (temperatureScore + vibrationScore) / 2
INSERT INTO sensor_readings (reading_id, machine_id, sensor_id, reading_value, temperature, vibration, operating_hours, health_score, severity_level, reading_time)
VALUES
(1, 1, 1, 1.2, 35.0, 1.2, 1200.0, 76.5, 'NORMAL', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 1, 1, 1.4, 38.0, 1.4, 1204.0, 74.0, 'NORMAL', NOW()),
(3, 2, 3, 3.8, 62.0, 3.8, 3450.0, 50.0, 'WARNING', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(4, 2, 3, 4.2, 65.0, 4.2, 3452.0, 46.5, 'WARNING', NOW()),
(5, 3, 5, 6.8, 82.0, 6.8, 5100.0, 25.0, 'CRITICAL', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(6, 3, 5, 7.4, 85.0, 7.4, 5101.0, 20.5, 'CRITICAL', NOW()),
(7, 4, 7, 1.8, 42.0, 1.8, 850.0, 70.0, 'NORMAL', NOW()),
(8, 5, 8, 5.2, 72.0, 5.2, 6200.0, 38.0, 'CRITICAL', NOW())
ON DUPLICATE KEY UPDATE reading_value = VALUES(reading_value);

INSERT INTO maintenance_requests (request_id, machine_id, title, description, priority, status, assigned_technician, scheduled_date, resolution_notes)
VALUES
(1, 3, 'High Spindle Vibration & Overheating Inspection', 'Elevated vibration and temperature. Bearing inspection required.', 'HIGH', 'PENDING', NULL, CURDATE(), NULL),
(2, 2, 'Scheduled Compressor Filter & Seal Inspection', 'Routine check due to elevated operating temperature.', 'MEDIUM', 'PENDING', NULL, DATE_ADD(CURDATE(), INTERVAL 2 DAY), NULL)
ON DUPLICATE KEY UPDATE title = VALUES(title);
