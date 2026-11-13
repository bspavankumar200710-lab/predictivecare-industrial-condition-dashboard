# Machines-Diagnosis Frontend

Predictive Maintenance Dashboard - React 19, TypeScript, Tailwind CSS, Vite.

## Features

- **Dark Industrial Telemetry Theme**: High-contrast, production-grade industrial monitoring dashboard.
- **Dynamic Equipment Metrics**: Total machines, online/offline breakdown, mean health index, and real-time alerts calculated from backend data.
- **Equipment Registration & CRUD**: Create, edit, inspect, and delete industrial machines.
- **Manual & Automated Sensor Ingestion**: Submit temperature and vibration readings to trigger live diagnostic health calculations.
- **Maintenance Order Management**: Create work orders, track status (`PENDING`, `IN_PROGRESS`, `COMPLETED`), and persist directly to the database.
- **OOAD Design Patterns Interactive Console**: Test the Factory Method, Adapter (Modbus CSV & IoT JSON parsing), and Strategy comparisons live in the UI.
- **Honest Connection State**: Prominent offline banner and indicators whenever the Spring Boot service is unavailable. No silent mock fallbacks pretending to be MySQL.

---

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start on `http://localhost:3000` (or `5173`).

---

## Building for Production

```bash
npm run build
```
Generates production assets in `dist/`.
