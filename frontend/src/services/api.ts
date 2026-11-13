import {
  Machine,
  SensorReading,
  Maintenance,
  calculateHealthScore,
} from '../types';

const STORAGE_KEYS = {
  BACKEND_URL: 'predictivecare_backend_url',
  LOCAL_MACHINES: 'predictivecare_local_machines',
  LOCAL_READINGS: 'predictivecare_local_readings',
  LOCAL_MAINTENANCE: 'predictivecare_local_maintenance',
  DEMO_MODE: 'predictivecare_allow_offline_demo',
};

// Default Spring Boot URL configured in application.properties
const DEFAULT_BACKEND_URL = 'http://localhost:8080/api';

class ApiService {
  private backendUrl: string;
  private isConnectedToSpringBoot = false;
  private lastErrorMessage = '';

  constructor() {
    this.backendUrl = localStorage.getItem(STORAGE_KEYS.BACKEND_URL) || DEFAULT_BACKEND_URL;
  }

  public getBackendUrl(): string {
    return this.backendUrl;
  }

  public setBackendUrl(url: string) {
    this.backendUrl = url.trim().replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEYS.BACKEND_URL, this.backendUrl);
  }

  public resetBackendUrl(): string {
    this.backendUrl = DEFAULT_BACKEND_URL;
    localStorage.setItem(STORAGE_KEYS.BACKEND_URL, DEFAULT_BACKEND_URL);
    return DEFAULT_BACKEND_URL;
  }

  public isSpringBootConnected(): boolean {
    return this.isConnectedToSpringBoot;
  }

  public getLastErrorMessage(): string {
    return this.lastErrorMessage;
  }

  public isDemoModeEnabled(): boolean {
    return localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true';
  }

  public setDemoModeEnabled(enabled: boolean) {
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, enabled ? 'true' : 'false');
  }

  /**
   * Ping Spring Boot backend to verify live connectivity
   */
  public async pingBackend(): Promise<{ connected: boolean; message: string; timestamp: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${this.backendUrl}/machines`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.isConnectedToSpringBoot = true;
        this.lastErrorMessage = '';
        return {
          connected: true,
          message: `Connected to Spring Boot backend at ${this.backendUrl}`,
          timestamp: new Date().toLocaleTimeString(),
        };
      } else {
        this.isConnectedToSpringBoot = false;
        this.lastErrorMessage = `Spring Boot responded with status ${response.status} (${response.statusText})`;
        return {
          connected: false,
          message: this.lastErrorMessage,
          timestamp: new Date().toLocaleTimeString(),
        };
      }
    } catch (err: any) {
      this.isConnectedToSpringBoot = false;
      this.lastErrorMessage = `Spring Boot backend is unreachable at ${this.backendUrl}. Please ensure Spring Boot is running (mvn spring-boot:run) and MySQL is active.`;
      return {
        connected: false,
        message: this.lastErrorMessage,
        timestamp: new Date().toLocaleTimeString(),
      };
    }
  }

  // ==========================================
  // Machine Endpoints (/api/machines)
  // ==========================================

  public async getMachines(): Promise<Machine[]> {
    try {
      const response = await fetch(`${this.backendUrl}/machines`, {
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        this.isConnectedToSpringBoot = true;
        const data = await response.json();
        // Also update local cache for offline inspection if desired
        this.saveLocalMachines(data);
        return data;
      }
      throw new Error(`Spring Boot returned ${response.status}: ${response.statusText}`);
    } catch (err: any) {
      this.isConnectedToSpringBoot = false;
      this.lastErrorMessage = `Failed to query Spring Boot at ${this.backendUrl}/machines.`;
      
      // If offline demo mode is allowed, return cached records with a warning
      if (this.isDemoModeEnabled()) {
        const cached = this.getLocalMachines();
        if (cached.length > 0) return cached;
      }
      
      throw new Error(`Cannot connect to Spring Boot backend (${this.backendUrl}). MySQL database records are unavailable. Ensure the Spring Boot backend is running on port 8080.`);
    }
  }

  public async getMachineById(id: number): Promise<Machine> {
    try {
      const response = await fetch(`${this.backendUrl}/machines/${id}`);
      if (response.ok) {
        this.isConnectedToSpringBoot = true;
        return await response.json();
      }
      throw new Error(`Machine #${id} not found`);
    } catch (err: any) {
      if (this.isDemoModeEnabled()) {
        const found = this.getLocalMachines().find((m) => m.id === id);
        if (found) return found;
      }
      throw new Error(`Cannot reach Spring Boot to fetch machine #${id}: ${err.message}`);
    }
  }

  public async addMachine(machineData: Omit<Machine, 'id'>): Promise<Machine> {
    try {
      const response = await fetch(`${this.backendUrl}/machines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(machineData),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to register machine on Spring Boot');
      }
      this.isConnectedToSpringBoot = true;
      const created = await response.json();
      return created;
    } catch (err: any) {
      if (this.isDemoModeEnabled()) {
        // Offline preview demo fallback
        const machines = this.getLocalMachines();
        const newId = machines.length > 0 ? Math.max(...machines.map((m) => m.id)) + 1 : 1;
        const localMachine: Machine = { ...machineData, id: newId };
        machines.push(localMachine);
        this.saveLocalMachines(machines);
        return localMachine;
      }
      throw new Error(`Cannot persist machine to MySQL database. Spring Boot backend is unreachable at ${this.backendUrl}/machines.`);
    }
  }

  public async updateMachine(id: number, machineData: Partial<Machine>): Promise<Machine> {
    try {
      const response = await fetch(`${this.backendUrl}/machines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(machineData),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to update machine on Spring Boot');
      }
      this.isConnectedToSpringBoot = true;
      return await response.json();
    } catch (err: any) {
      if (this.isDemoModeEnabled()) {
        const machines = this.getLocalMachines();
        const index = machines.findIndex((m) => m.id === id);
        if (index !== -1) {
          machines[index] = { ...machines[index], ...machineData, id };
          this.saveLocalMachines(machines);
          return machines[index];
        }
      }
      throw new Error(`Cannot update machine record in MySQL. Spring Boot backend is unreachable at ${this.backendUrl}/machines/${id}.`);
    }
  }

  public async deleteMachine(id: number): Promise<{ message: string; id: number }> {
    try {
      const response = await fetch(`${this.backendUrl}/machines/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to delete machine on Spring Boot');
      }
      this.isConnectedToSpringBoot = true;
      return { message: 'Machine deleted successfully', id };
    } catch (err: any) {
      if (this.isDemoModeEnabled()) {
        const machines = this.getLocalMachines().filter((m) => m.id !== id);
        this.saveLocalMachines(machines);
        return { message: 'Machine deleted from local preview', id };
      }
      throw new Error(`Cannot delete machine in MySQL. Spring Boot backend is unreachable at ${this.backendUrl}/machines/${id}.`);
    }
  }

  // ==========================================
  // Sensor Readings Endpoints (/api/machines/{machineId}/readings)
  // ==========================================

  public async getReadings(machineId: number): Promise<SensorReading[]> {
    try {
      const response = await fetch(`${this.backendUrl}/machines/${machineId}/readings`);
      if (response.ok) {
        this.isConnectedToSpringBoot = true;
        const data: SensorReading[] = await response.json();
        return [...data].sort((a, b) => b.id - a.id);
      }
      return [];
    } catch (err: any) {
      if (this.isDemoModeEnabled()) {
        return this.getLocalReadings()
          .filter((r) => (r.machine?.id ?? r.machineId) === machineId)
          .sort((a, b) => b.id - a.id);
      }
      return [];
    }
  }

  public async addReading(
    machineId: number,
    readingData: { temperature: number; vibration: number; operatingHours: number; strategyName?: string }
  ): Promise<SensorReading> {
    try {
      const response = await fetch(`${this.backendUrl}/machines/${machineId}/readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readingData),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to save sensor reading on Spring Boot');
      }
      this.isConnectedToSpringBoot = true;
      return await response.json();
    } catch (err: any) {
      if (this.isDemoModeEnabled()) {
        const breakdown = calculateHealthScore(readingData.temperature, readingData.vibration);
        const readings = this.getLocalReadings();
        const newId = readings.length > 0 ? Math.max(...readings.map((r) => r.id)) + 1 : 1;
        const localReading: SensorReading = {
          id: newId,
          machineId,
          readingValue: Number(readingData.temperature),
          temperature: Number(readingData.temperature),
          vibration: Number(readingData.vibration),
          operatingHours: Number(readingData.operatingHours),
          healthScore: breakdown.healthScore,
          severityLevel: breakdown.category.toUpperCase(),
          readingTime: new Date().toISOString(),
        };
        readings.push(localReading);
        this.saveLocalReadings(readings);
        return localReading;
      }
      throw new Error(`Cannot save sensor reading to MySQL. Spring Boot backend is unreachable at ${this.backendUrl}/machines/${machineId}/readings.`);
    }
  }

  public async addReadingFromCsv(machineId: number, rawCsv: string): Promise<SensorReading> {
    try {
      const response = await fetch(`${this.backendUrl}/machines/${machineId}/readings/adapter/csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: rawCsv,
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to ingest CSV reading on Spring Boot');
      }
      this.isConnectedToSpringBoot = true;
      return await response.json();
    } catch (err: any) {
      throw new Error(`Adapter ingestion failed: ${err.message}`);
    }
  }

  public async addReadingFromIotJson(machineId: number, rawJson: string): Promise<SensorReading> {
    try {
      const response = await fetch(`${this.backendUrl}/machines/${machineId}/readings/adapter/iot-json`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: rawJson,
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to ingest IoT JSON reading on Spring Boot');
      }
      this.isConnectedToSpringBoot = true;
      return await response.json();
    } catch (err: any) {
      throw new Error(`Adapter ingestion failed: ${err.message}`);
    }
  }

  // ==========================================
  // Maintenance Endpoints (/api/maintenance)
  // ==========================================

  public async getMaintenance(): Promise<Maintenance[]> {
    try {
      const response = await fetch(`${this.backendUrl}/maintenance`);
      if (response.ok) {
        this.isConnectedToSpringBoot = true;
        const data = await response.json();
        return data.map((item: any) => ({
          id: item.id,
          machineId: item.machineId,
          machine: item.machine || {
            id: item.machineId,
            machineName: item.machineName || `Machine #${item.machineId}`,
            machineCode: item.machineCode || `MC-${item.machineId}`,
            location: '',
          },
          title: item.title,
          description: item.description,
          priority: item.priority,
          status: item.status,
          assignedTechnician: item.assignedTechnician,
          requestDate: item.createdAt || new Date().toISOString(),
          scheduledDate: item.scheduledDate,
          completionDate: item.completedDate,
          notes: item.resolutionNotes,
          resolutionNotes: item.resolutionNotes,
          isDemoData: false,
        }));
      }
      return [];
    } catch (err: any) {
      if (this.isDemoModeEnabled()) {
        return this.getLocalMaintenance();
      }
      throw new Error(`Cannot query maintenance records from MySQL. Spring Boot backend is unreachable at ${this.backendUrl}/maintenance.`);
    }
  }

  public async createMaintenance(
    machineId: number,
    data: {
      title: string;
      description: string;
      priority: string;
      scheduledDate?: string | null;
      notes?: string | null;
    }
  ): Promise<Maintenance> {
    try {
      const response = await fetch(`${this.backendUrl}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineId,
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: 'PENDING',
          scheduledDate: data.scheduledDate || null,
          resolutionNotes: data.notes || null,
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to create maintenance order on Spring Boot');
      }
      this.isConnectedToSpringBoot = true;
      const item = await response.json();
      return {
        id: item.id,
        machineId: item.machineId,
        machine: item.machine || {
          id: item.machineId,
          machineName: item.machineName || `Machine #${item.machineId}`,
          machineCode: item.machineCode || `MC-${item.machineId}`,
          location: '',
        },
        title: item.title,
        description: item.description,
        priority: item.priority,
        status: item.status,
        assignedTechnician: item.assignedTechnician,
        requestDate: item.createdAt || new Date().toISOString(),
        scheduledDate: item.scheduledDate,
        completionDate: item.completedDate,
        notes: item.resolutionNotes,
        resolutionNotes: item.resolutionNotes,
        isDemoData: false,
      };
    } catch (err: any) {
      if (this.isDemoModeEnabled()) {
        const list = this.getLocalMaintenance();
        const newId = list.length > 0 ? Math.max(...list.map((m) => m.id)) + 1 : 1;
        const machine = this.getLocalMachines().find((m) => m.id === machineId) || {
          id: machineId,
          machineName: `Machine #${machineId}`,
          machineCode: `MC-${machineId}`,
        };
        const newOrder: Maintenance = {
          id: newId,
          machine: machine as Machine,
          machineId,
          title: data.title,
          description: data.description,
          priority: data.priority as any,
          status: 'PENDING' as any,
          requestDate: new Date().toISOString(),
          scheduledDate: data.scheduledDate || null,
          notes: data.notes || null,
          isDemoData: true,
        };
        list.unshift(newOrder);
        this.saveLocalMaintenance(list);
        return newOrder;
      }
      throw new Error(`Cannot persist maintenance order to MySQL. Spring Boot backend is unreachable at ${this.backendUrl}/maintenance.`);
    }
  }

  public async updateMaintenanceStatus(
    id: number,
    status: string,
    resolutionNotes?: string
  ): Promise<Maintenance> {
    try {
      const response = await fetch(`${this.backendUrl}/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolutionNotes }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to update maintenance order on Spring Boot');
      }
      this.isConnectedToSpringBoot = true;
      return await response.json();
    } catch (err: any) {
      if (this.isDemoModeEnabled()) {
        const list = this.getLocalMaintenance();
        const index = list.findIndex((m) => m.id === id);
        if (index !== -1) {
          list[index] = {
            ...list[index],
            status: status as any,
            resolutionNotes: resolutionNotes || list[index].resolutionNotes,
          };
          this.saveLocalMaintenance(list);
          return list[index];
        }
      }
      throw new Error(`Cannot update maintenance status in MySQL. Spring Boot backend is unreachable at ${this.backendUrl}/maintenance/${id}.`);
    }
  }

  public async deleteMaintenance(id: number): Promise<{ message: string; id: number }> {
    try {
      const response = await fetch(`${this.backendUrl}/maintenance/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to delete maintenance order on Spring Boot');
      }
      this.isConnectedToSpringBoot = true;
      return { message: 'Maintenance order deleted successfully', id };
    } catch (err: any) {
      if (this.isDemoModeEnabled()) {
        const list = this.getLocalMaintenance().filter((m) => m.id !== id);
        this.saveLocalMaintenance(list);
        return { message: 'Deleted locally', id };
      }
      throw new Error(`Cannot delete maintenance order from MySQL. Spring Boot backend is unreachable at ${this.backendUrl}/maintenance/${id}.`);
    }
  }

  // Local persistence helpers for preview fallback when explicitly enabled
  private getLocalMachines(): Machine[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_MACHINES);
    return raw ? JSON.parse(raw) : [];
  }

  private saveLocalMachines(machines: Machine[]) {
    localStorage.setItem(STORAGE_KEYS.LOCAL_MACHINES, JSON.stringify(machines));
  }

  private getLocalReadings(): SensorReading[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_READINGS);
    return raw ? JSON.parse(raw) : [];
  }

  private saveLocalReadings(readings: SensorReading[]) {
    localStorage.setItem(STORAGE_KEYS.LOCAL_READINGS, JSON.stringify(readings));
  }

  private getLocalMaintenance(): Maintenance[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_MAINTENANCE);
    return raw ? JSON.parse(raw) : [];
  }

  private saveLocalMaintenance(maintenance: Maintenance[]) {
    localStorage.setItem(STORAGE_KEYS.LOCAL_MAINTENANCE, JSON.stringify(maintenance));
  }

  public seedDemoDataIfRequested() {
    this.setDemoModeEnabled(true);
    const initialMachines: Machine[] = [
      {
        id: 1,
        machineName: 'Centrifugal Slurry Pump',
        machineCode: 'PUMP-001',
        machineType: 'Centrifugal Pump',
        location: 'Bay 1 - Pumping Station',
        status: 'Healthy',
        installationDate: '2023-01-15',
      },
      {
        id: 2,
        machineName: 'Rotary Screw Compressor',
        machineCode: 'COMP-102',
        machineType: 'Compressor',
        location: 'Utility Room B',
        status: 'Warning',
        installationDate: '2022-08-20',
      },
      {
        id: 3,
        machineName: 'CNC Vertical Milling Spindle',
        machineCode: 'CNC-404',
        machineType: 'CNC Milling Machine',
        location: 'Precision Machining Hall',
        status: 'Critical',
        installationDate: '2021-11-05',
      },
    ];

    const r1: SensorReading = {
      id: 1,
      machineId: 1,
      readingValue: 35.0,
      temperature: 35.0,
      vibration: 1.2,
      operatingHours: 1200.0,
      healthScore: 76.5,
      severityLevel: 'NORMAL',
      readingTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    };

    const r2: SensorReading = {
      id: 2,
      machineId: 2,
      readingValue: 62.0,
      temperature: 62.0,
      vibration: 3.8,
      operatingHours: 3450.0,
      healthScore: 50.0,
      severityLevel: 'WARNING',
      readingTime: new Date(Date.now() - 3600000 * 1).toISOString(),
    };

    const r3: SensorReading = {
      id: 3,
      machineId: 3,
      readingValue: 85.0,
      temperature: 85.0,
      vibration: 7.4,
      operatingHours: 5100.0,
      healthScore: 20.5,
      severityLevel: 'CRITICAL',
      readingTime: new Date().toISOString(),
    };

    this.saveLocalMachines(initialMachines);
    this.saveLocalReadings([r1, r2, r3]);
    this.saveLocalMaintenance([]);
  }

  public clearAllLocalData() {
    localStorage.removeItem(STORAGE_KEYS.LOCAL_MACHINES);
    localStorage.removeItem(STORAGE_KEYS.LOCAL_READINGS);
    localStorage.removeItem(STORAGE_KEYS.LOCAL_MAINTENANCE);
    this.setDemoModeEnabled(false);
  }
}

export const api = new ApiService();
