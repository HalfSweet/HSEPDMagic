export interface Project {
  id: string;
  name: string;
  chipModel: 'ssd1677';
  createdTime: string;
  updatedTime: string;
  config?: ProjectConfig;
}

export interface ProjectConfig {
  // SSD1677 specific configuration
  lutData?: LUTData;
  temperature?: TemperatureConfig;
  voltageSettings?: VoltageSettings;
  // Add more configuration fields as needed
}

export interface VoltageSettings {
  vgh: number;  // Gate High Voltage
  vgl: number;  // Gate Low Voltage
  vsh: number;  // Source High Voltage
  vshr: number; // Source High Voltage Reference
  vsl: number;  // Source Low Voltage
  vcom: number; // VCOM Voltage
}

export interface LUTData {
  phases: LUTPhase[];
  repeatCount?: number;
  frameRate?: number;
}

export interface LUTPhase {
  id: string;
  name: string;
  duration: number; // in milliseconds
  voltagePattern: VoltagePattern;
}

export interface VoltagePattern {
  vsh: number;  // Source High Voltage
  vsl: number;  // Source Low Voltage
  vgh: number;  // Gate High Voltage
  vgl: number;  // Gate Low Voltage
}

export interface TemperatureConfig {
  ranges: TemperatureRange[];
}

export interface TemperatureRange {
  min: number;
  max: number;
  lutAdjustment: number;
}

export interface DriverICConfig {
  id: string;
  name: string;
  defaultConfig: any;
  voltageRanges: {
    vsh: { min: number; max: number; step: number };
    vsl: { min: number; max: number; step: number };
    vgh: { min: number; max: number; step: number };
    vgl: { min: number; max: number; step: number };
  };
}
