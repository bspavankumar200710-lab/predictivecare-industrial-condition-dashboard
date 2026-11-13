# Machines-Diagnosis Spring Boot Backend

Predictive Maintenance System - Java 21 & Spring Boot REST API Service.

## Technology Stack

- **Java**: OpenJDK 21 (LTS)
- **Framework**: Spring Boot 3.3.5
- **ORM / Persistence**: Spring Data JPA / Hibernate 6.5
- **Validation**: Jakarta Bean Validation (`spring-boot-starter-validation`)
- **Database**: MySQL 8.0+ (Production / Development), H2 (In-memory testing)
- **Build Tool**: Apache Maven 3.8+ / Maven Wrapper (`./mvnw`)

---

## Architecture & Directory Structure

```text
backend/
├── pom.xml                               # Maven project dependencies & build configuration
├── mvnw / mvnw.cmd                       # Maven Wrapper executables for Unix & Windows
├── .mvn/wrapper/                         # Maven wrapper properties & jar
├── README.md                             # Backend documentation
└── src/
    ├── main/
    │   ├── java/com/predictive/backend/
    │   │   ├── BackendApplication.java   # Spring Boot entry point (@SpringBootApplication)
    │   │   ├── config/
    │   │   │   └── WebConfig.java        # CORS policy and global web filters
    │   │   ├── controller/
    │   │   │   ├── MachineController.java           # /api/machines CRUD
    │   │   │   ├── SensorReadingController.java     # /api/readings ingestion & history
    │   │   │   ├── MaintenanceRequestController.java # /api/maintenance orders
    │   │   │   └── DesignPatternDemoController.java # /api/patterns verification
    │   │   ├── dto/                      # Data Transfer Objects (Request/Response)
    │   │   ├── entity/                   # JPA Entities (Machine, Sensor, SensorReading, MaintenanceRequest)
    │   │   ├── entity/enums/             # Enums: MachineStatus, Priority, MaintenanceStatus, SensorType
    │   │   ├── exception/                # GlobalExceptionHandler & ResourceNotFoundException
    │   │   ├── patterns/
    │   │   │   ├── strategy/             # Strategy Pattern for health evaluation
    │   │   │   ├── factory/              # Factory Method Pattern for sensors
    │   │   │   └── adapter/              # Adapter Pattern for legacy telemetry ingestion
    │   │   ├── repository/               # Spring Data JPA repositories
    │   │   └── service/                  # Business logic services
    │   └── resources/
    │       ├── application.properties    # Environment-variable driven MySQL config
    │       ├── schema.sql                # Complete relational schema DDL
    │       └── data.sql                  # Verified seed data (realistic records)
    └── test/
        ├── java/com/predictive/backend/  # JUnit 5 & Mockito test suites
        └── resources/
            └── application.properties    # H2 in-memory test database configuration
```

---

## Health-Score Calculation Formula

The primary health evaluation engine (`StandardHeuristicStrategy`) implements the verified industrial formula:

$$\text{temperatureScore} = \max(0, 100 - \text{temperature})$$
$$\text{vibrationScore} = \max(0, 100 - \text{vibration} \times 10)$$
$$\text{healthScore} = \frac{\text{temperatureScore} + \text{vibrationScore}}{2}$$

### Dynamic Thresholds:
- **HEALTHY**: $\text{score} \ge 70.0$
- **WARNING**: $40.0 \le \text{score} < 70.0$
- **CRITICAL**: $\text{score} < 40.0$

*Note: Unvalidated ISO 10816 claims have been removed to ensure scientific and engineering integrity.*

---

## Database Configuration (MySQL)

Create the MySQL database:
```sql
CREATE DATABASE predictive_maintenance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Configure credentials via environment variables:
```bash
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/predictive_maintenance?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="your_password"
```

---

## Running & Testing

### 1. Run Unit & Integration Tests (H2 in-memory, no external DB needed)
```bash
./mvnw test
```
*Current test suite: 24 tests passing, 0 failures, 0 errors.*

### 2. Run the Spring Boot Application
```bash
./mvnw spring-boot:run
```
The server starts on port `8080`.

---

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/machines` | List all registered machines |
| `POST` | `/api/machines` | Register a new machine |
| `GET` | `/api/machines/{id}` | Get machine details with current health |
| `PUT` | `/api/machines/{id}` | Update machine specifications |
| `DELETE` | `/api/machines/{id}` | Remove machine record |
| `POST` | `/api/readings` | Ingest sensor telemetry and compute health score |
| `GET` | `/api/readings/machine/{id}` | Telemetry history for a machine |
| `GET` | `/api/readings/alerts` | Active machine alerts |
| `GET` | `/api/maintenance` | List all maintenance requests |
| `POST` | `/api/maintenance` | Submit new maintenance work order |
| `PUT` | `/api/maintenance/{id}` | Update maintenance status or notes |
| `DELETE` | `/api/maintenance/{id}` | Delete maintenance request |
| `POST` | `/api/patterns/adapter/csv` | Ingest Legacy Modbus CSV via Adapter Pattern |
| `POST` | `/api/patterns/adapter/iot-json`| Ingest IoT JSON payload via Adapter Pattern |
| `GET` | `/api/patterns/strategy/compare` | Compare Strategy Pattern outputs across algorithms |
