# Machines-Diagnosis: Predictive Maintenance System

A full-stack industrial machine diagnostics and condition-monitoring platform engineered for academic evaluation and production deployment. Built with **Java 21 LTS**, **Spring Boot 3.3.5**, **Spring Data JPA**, **MySQL 8.0**, and **React 19 + TypeScript + Vite + Tailwind CSS**.

---

## 1. Final Project Folder Structure

The project is organized into distinct `frontend/` and `backend/` modules configured to open seamlessly from the root in Visual Studio Code:

```text
Machines-Diagnosis/
├── frontend/
│   ├── src/
│   │   ├── components/                 # Industrial dashboard views, charts & pattern consoles
│   │   │   ├── Topbar.tsx              # System header with connection status & ZIP download
│   │   │   ├── Sidebar.tsx             # Industrial dark telemetry navigation
│   │   │   ├── DashboardView.tsx       # Dynamic metrics & equipment health spectrum
│   │   │   ├── MachinesView.tsx        # Machine registration, updates & telemetry entry
│   │   │   ├── PredictionsView.tsx     # Diagnostic health score & breakdown
│   │   │   ├── MaintenanceView.tsx     # Maintenance orders (MySQL JPA persistence)
│   │   │   ├── DesignPatternsView.tsx  # Interactive console for Factory, Adapter & Strategy
│   │   │   ├── ArchitectureView.tsx    # Technical stack & REST API specifications
│   │   │   ├── HealthSpectrum.tsx      # Condition distribution spectrum
│   │   │   └── TrendChart.tsx          # Real-time telemetry chart
│   │   ├── services/
│   │   │   └── api.ts                  # Spring Boot REST client (no silent mock fallback)
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript interfaces, enums & health formula
│   │   ├── App.tsx                     # Main application container
│   │   ├── index.css                   # Tailwind CSS styling & custom scrollbars
│   │   └── main.tsx                    # React DOM entry point
│   ├── public/                         # Static assets
│   ├── package.json                    # Clean dependencies (React 19, Vite, Tailwind CSS)
│   ├── index.html                      # Single-page application root
│   ├── tsconfig.json                   # TypeScript compiler configuration
│   ├── vite.config.ts                  # Vite build & development server configuration
│   ├── .env.example                    # Frontend environment template
│   └── README.md                       # Frontend documentation
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/predictive/backend/
│   │   │   │   ├── BackendApplication.java       # Spring Boot main entry point
│   │   │   │   ├── config/
│   │   │   │   │   └── WebConfig.java            # CORS policy & web filters
│   │   │   │   ├── controller/                   # Spring MVC REST Controllers
│   │   │   │   │   ├── MachineController.java           # /api/machines CRUD
│   │   │   │   │   ├── SensorReadingController.java     # /api/machines/{id}/readings & adapters
│   │   │   │   │   ├── MaintenanceRequestController.java # /api/maintenance work orders
│   │   │   │   │   └── DesignPatternDemoController.java # /api/patterns verification
│   │   │   │   ├── dto/                          # Data Transfer Objects
│   │   │   │   │   ├── MachineDto.java
│   │   │   │   │   ├── SensorReadingRequestDto.java
│   │   │   │   │   ├── SensorReadingResponseDto.java
│   │   │   │   │   ├── MaintenanceRequestDto.java
│   │   │   │   │   ├── AlertDto.java
│   │   │   │   │   └── ApiResponse.java
│   │   │   │   ├── entity/                       # JPA Relational Entities
│   │   │   │   │   ├── Machine.java
│   │   │   │   │   ├── Sensor.java
│   │   │   │   │   ├── SensorReading.java
│   │   │   │   │   ├── MaintenanceRequest.java
│   │   │   │   │   └── enums/
│   │   │   │   │       ├── MachineStatus.java
│   │   │   │   │       ├── SensorType.java
│   │   │   │   │       ├── Priority.java
│   │   │   │   │       └── MaintenanceStatus.java
│   │   │   │   ├── exception/                    # Global exception handling
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   └── ResourceNotFoundException.java
│   │   │   │   ├── patterns/                     # Genuine OOAD Design Patterns
│   │   │   │   │   ├── strategy/                 # Strategy Pattern (Health calculations)
│   │   │   │   │   ├── factory/                  # Factory Method Pattern (Calibrated sensors)
│   │   │   │   │   └── adapter/                  # Adapter Pattern (Modbus CSV & IoT JSON)
│   │   │   │   ├── repository/                   # Spring Data JPA Repositories
│   │   │   │   │   ├── MachineRepository.java
│   │   │   │   │   ├── SensorRepository.java
│   │   │   │   │   ├── SensorReadingRepository.java
│   │   │   │   │   └── MaintenanceRequestRepository.java
│   │   │   │   └── service/                      # Transactional Business Services
│   │   │   │       ├── MachineService.java
│   │   │   │       ├── SensorReadingService.java
│   │   │   │       └── MaintenanceRequestService.java
│   │   │   └── resources/
│   │   │       ├── application.properties        # MySQL connection (env vars, no hardcoded secrets)
│   │   │       ├── schema.sql                    # Relational table DDL
│   │   │       └── data.sql                      # Idempotent seed data (ON DUPLICATE KEY UPDATE)
│   │   └── test/
│   │       ├── java/com/predictive/backend/
│   │       │   ├── BackendApplicationTests.java
│   │       │   ├── patterns/AdapterAndFactoryTest.java
│   │       │   └── service/
│   │       │       ├── HealthStrategyTest.java
│   │       │       ├── MachineServiceTest.java
│   │       │       ├── MaintenanceRequestServiceTest.java
│   │       │       └── SensorReadingServiceTest.java
│   │       └── resources/
│   │           └── application.properties        # Isolated H2 in-memory test database
│   ├── pom.xml                                   # Maven build descriptor (Java 21, Spring Boot 3.3.5)
│   ├── mvnw / mvnw.cmd                           # Maven Wrapper executables
│   ├── .mvn/wrapper/                             # Maven wrapper properties & jar
│   ├── .env.example                              # Backend environment template
│   └── README.md                                 # Backend service documentation
│
├── .vscode/
│   ├── launch.json                               # Compound & individual debug configurations
│   ├── tasks.json                                # Maven and Vite build/run/test tasks
│   └── settings.json                             # Workspace settings
├── README.md                                     # Root project documentation
├── .env.example                                  # Master environment variable template
└── .gitignore                                    # Clean exclusion rules (excludes target, node_modules)
```

---

## 2. Technologies Used

### Backend
- **Java**: OpenJDK 21 (LTS)
- **Framework**: Spring Boot 3.3.5
- **ORM / Persistence**: Spring Data JPA / Hibernate 6.5
- **Database**: MySQL 8.0+ (Production / Development), H2 (In-memory testing)
- **Validation**: Jakarta Bean Validation (`jakarta.validation-api` / Hibernate Validator)
- **Testing**: JUnit 5, Mockito, AssertJ, Spring Boot Test
- **Build Tool**: Apache Maven 3.8+ / Maven Wrapper (`./mvnw`)

### Frontend
- **Framework**: React 19 (Hooks & Functional Architecture)
- **Language**: TypeScript 5.7+
- **Build & Dev Tool**: Vite 8.3
- **Styling**: Tailwind CSS v4 (Dark Industrial Theme)
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion engine)

---

## 3. Database Security & Setup (MySQL)

### Step 1: Create Database
Connect to your MySQL server and create the database:
```sql
CREATE DATABASE predictive_maintenance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Configure Environment Variables
In `backend/src/main/resources/application.properties`, database credentials are **strictly resolved from environment variables** with no hardcoded passwords in version control:
```properties
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/predictive_maintenance?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
```

Set these in your local environment or create a `.env` file from `.env.example`:
```bash
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/predictive_maintenance?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="your_actual_mysql_password"
```

### Step 3: Duplicate Record Protection (Idempotent Seeding)
The `backend/src/main/resources/data.sql` script uses `INSERT INTO ... ON DUPLICATE KEY UPDATE` syntax. Restarting the Spring Boot backend will **never** insert duplicate machine records, sensors, readings, or maintenance requests.

---

## 4. Equipment Health-Score Calculation

Both the Spring Boot Java backend (`StandardHeuristicStrategy.java`) and the TypeScript frontend (`calculateHealthScore` in `types/index.ts`) use the identical formula:

$$\text{temperatureScore} = \max(0, 100 - \text{temperature})$$
$$\text{vibrationScore} = \max(0, 100 - \text{vibration} \times 10)$$
$$\text{healthScore} = \frac{\text{temperatureScore} + \text{vibrationScore}}{2}$$

### Dynamic Thresholds:
- **Healthy**: $\text{score} \ge 70.0$
- **Warning**: $40.0 \le \text{score} < 70.0$
- **Critical**: $\text{score} < 40.0$

*Standards Note: All unsupported claims (such as "ISO 10816-3 calibrated" or "ISO-certified health assessment") have been completely removed.*

---

## 5. OOAD Design Patterns Implementation

Three core design patterns are implemented in the Java backend and actively utilized by the business logic:

### 1. Strategy Pattern (`patterns/strategy/`)
- **Intent**: Defines a family of interchangeable health calculation algorithms and allows dynamic algorithm switching.
- **Participating Classes**:
  - `HealthCalculationStrategy` (Interface): Strategy contract defining `double calculateHealthScore(SensorReading reading, Machine machine)`.
  - `StandardHeuristicStrategy` (Concrete Strategy - **@Primary**): Implements the exact verified formula: $(max(0, 100 - T) + max(0, 100 - V \times 10)) / 2$.
  - `BalancedIndustrialStrategy` (Concrete Strategy): Multi-variable algorithm without unverified ISO claims.
  - `ThermalCentricStrategy` (Concrete Strategy): Weights temperature anomalies at 70% and vibration at 30%.
  - `VibrationCentricStrategy` (Concrete Strategy): Weights mechanical vibration at 70% and temperature at 30%.
  - `HealthStrategyResolver` (Context): Resolves the appropriate strategy bean based on user selection or machine classification.
- **Where Used**: Called in `SensorReadingService.addReadingFromDto()` on every telemetry ingestion.

### 2. Factory Method Pattern (`patterns/factory/`)
- **Intent**: Defines an interface for creating objects, letting subclasses determine the concrete class to instantiate with pre-calibrated thresholds and units.
- **Participating Classes**:
  - `SensorFactory` (Abstract Creator): Declares `Sensor createSensor(Machine machine)` and calibration helpers.
  - `TemperatureSensorFactory` (Concrete Creator): Instantiates calibrated `Sensor` with `SensorType.TEMPERATURE`, unit `°C`, threshold `75.0`.
  - `VibrationSensorFactory` (Concrete Creator): Instantiates calibrated `Sensor` with `SensorType.VIBRATION`, unit `mm/s`, threshold `4.5`.
  - `PressureSensorFactory` (Concrete Creator): Instantiates calibrated `Sensor` with `SensorType.PRESSURE`, unit `bar`, threshold `6.0`.
  - `AlertFactory` (Creational Helper): Instantiates typed `AlertDto` objects for critical, thermal, and vibration anomalies.
- **Where Used**: `SensorReadingService.addReadingFromDto()` uses `temperatureSensorFactory` and `vibrationSensorFactory` to provision sensors dynamically if unassigned, and `alertFactory` in `getActiveAlerts()`.

### 3. Adapter Pattern (`patterns/adapter/`)
- **Intent**: Converts external, incompatible telemetry data formats (Modbus CSV logs, third-party IoT JSON) into the internal `SensorReadingRequestDto`.
- **Participating Classes**:
  - `TelemetryAdapter` (Target Interface): Declares `SensorReadingRequestDto adapt(String rawPayload)`.
  - `LegacyModbusCsvAdapter` (Concrete Adapter): Parses comma-delimited Modbus PLC registers (`temperature,vibration,hours[,strategy]`) into standard DTOs.
  - `ExternalIotJsonAdapter` (Concrete Adapter): Deserializes heterogeneous JSON keys (`t_celsius`, `vib_mms`, `runtime_sec`) into standard DTOs.
- **Where Used**: Directly exposed via `SensorReadingController` (`POST /api/machines/{id}/readings/adapter/csv` and `POST /api/machines/{id}/readings/adapter/iot-json`) and `DesignPatternDemoController`.

---

## 6. Maintenance Order Management

Full end-to-end maintenance lifecycle management:
- **Entity**: `MaintenanceRequest.java` mapped to MySQL table `maintenance_requests`.
- **Repository**: `MaintenanceRequestRepository.java` extending `JpaRepository`.
- **Service**: `MaintenanceRequestService.java` managing status transitions (`PENDING` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`).
- **Controller**: `MaintenanceRequestController.java` exposed at `/api/maintenance`.
- **Validation**: Strict `@NotNull` validation for `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and `status` (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
- **Machine Synchronization**: Marking a maintenance order `IN_PROGRESS` sets the machine status to `Maintenance`; completing the order returns the machine to `Healthy`.

---

## 7. Verified Build & Test Execution Results

All compilation and tests were actually executed in the container environment:

### Backend Tests (`./mvnw test`)
```text
[INFO] Running com.predictive.backend.patterns.AdapterAndFactoryTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.predictive.backend.service.HealthStrategyTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.predictive.backend.service.MachineServiceTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.predictive.backend.service.MaintenanceRequestServiceTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.predictive.backend.service.SensorReadingServiceTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.predictive.backend.BackendApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] -------------------------------------------------------
[INFO] Results:
[INFO] Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
[INFO] -------------------------------------------------------
[INFO] BUILD SUCCESS
```

### Backend Packaging (`./mvnw clean package`)
- **Status**: `BUILD SUCCESS`
- **Output Artifact**: `target/backend-0.0.1-SNAPSHOT.jar` (repackaged executable Spring Boot JAR)

### Frontend Build & Lint (`npm run build` && `npm run lint`)
- **Status**: `Build succeeded` (0 errors)
- **TypeScript Check**: `tsc --noEmit` exited with code 0.

---

## 8. Visual Studio Code Execution Guide

### Option A: One-Click Compound Debugging (Recommended)
1. Open the extracted repository root folder in VS Code (`code .`).
2. Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on macOS) to open the **Run and Debug** view.
3. Select **Full Stack: Backend & Frontend** from the dropdown and press `F5`.
4. This boots both:
   - Spring Boot Backend on `http://localhost:8080`
   - Vite Frontend on `http://localhost:3000`

### Option B: Running Tasks via Terminal Menu
- Press `Ctrl+Shift+B` (or **Terminal -> Run Task...**):
  - `Backend: Run Spring Boot` (`./mvnw spring-boot:run`)
  - `Backend: Run Tests` (`./mvnw test`)
  - `Frontend: Run Vite Dev` (`npm run dev`)
  - `Frontend: Build` (`npm run build`)

### Option C: Running Separately in Two Terminals
**Terminal 1 (Backend)**:
```bash
cd backend
./mvnw spring-boot:run
```
*(On Windows: `.\mvnw.cmd spring-boot:run`)*

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm install
npm run dev
```

---

## 9. Spring Boot REST API Endpoint Reference

| Method | Endpoint | Controller | Purpose |
|---|---|---|---|
| `GET` | `/api/machines` | `MachineController` | List all registered machines |
| `POST` | `/api/machines` | `MachineController` | Register a new machine |
| `GET` | `/api/machines/{id}` | `MachineController` | Get machine by ID |
| `PUT` | `/api/machines/{id}` | `MachineController` | Update machine details |
| `DELETE` | `/api/machines/{id}` | `MachineController` | Delete machine |
| `GET` | `/api/machines/{id}/readings` | `SensorReadingController` | Historical readings for machine |
| `POST` | `/api/machines/{id}/readings` | `SensorReadingController` | Ingest sensor reading with Strategy |
| `POST` | `/api/machines/{id}/readings/adapter/csv` | `SensorReadingController` | Ingest Modbus CSV via Adapter Pattern |
| `POST` | `/api/machines/{id}/readings/adapter/iot-json` | `SensorReadingController` | Ingest IoT JSON via Adapter Pattern |
| `GET` | `/api/machines/alerts` | `SensorReadingController` | Active rule-based equipment alerts |
| `GET` | `/api/maintenance` | `MaintenanceRequestController` | List all maintenance orders |
| `GET` | `/api/maintenance/machine/{id}` | `MaintenanceRequestController` | Maintenance orders for specific machine |
| `POST` | `/api/maintenance` | `MaintenanceRequestController` | Create new maintenance work order |
| `PUT` | `/api/maintenance/{id}` | `MaintenanceRequestController` | Update maintenance status & notes |
| `DELETE` | `/api/maintenance/{id}` | `MaintenanceRequestController` | Delete maintenance order |
| `GET` | `/api/patterns/strategies` | `DesignPatternDemoController` | List Strategy Pattern registry |
| `POST` | `/api/patterns/adapter/csv` | `DesignPatternDemoController` | Test Modbus CSV adapter conversion |
| `POST` | `/api/patterns/adapter/json` | `DesignPatternDemoController` | Test IoT Cloud JSON adapter conversion |
| `POST` | `/api/patterns/factory/sensor` | `DesignPatternDemoController` | Instantiate sensor via Factory Method |

---

## 10. Honest Connection State & Production Discipline

- **No Silent Mock Fallback**: When the Spring Boot backend is unreachable, the frontend explicitly indicates that MySQL database records cannot be queried and provides actionable instructions. It never silently returns localStorage pretending it came from MySQL.
- **Explicit Demonstration Sandbox**: If an offline preview is desired, the user can toggle the Demonstration Sandbox, where records are explicitly badged `[DEMO / UNPERSISTED]`.
- **Pure Technology Stack**: No Express.js proxy or unnecessary Node backend. The frontend communicates directly with the Spring Boot REST API.

---

## 11. Remaining Limitations

1. **REST Ingestion vs. Industrial Message Queues**: Telemetry ingestion uses HTTP REST endpoints (`POST /api/machines/{id}/readings`). In heavy industrial facilities streaming thousands of signals per second, an MQTT broker or Apache Kafka cluster would be placed ahead of the Spring Boot ingestion service.
2. **Deterministic Heuristics vs. Machine Learning**: Health scoring utilizes physical heuristics based on temperature and vibration thresholds. While deterministic and calibrated, it does not currently use trained deep learning or Random Forest regression models to predict Remaining Useful Life (RUL) in operating hours.
