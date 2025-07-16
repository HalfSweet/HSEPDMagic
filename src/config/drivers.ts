import { DriverICConfig } from '@/types';

export const SSD1677_CONFIG: DriverICConfig = {
  id: 'ssd1677',
  name: 'SSD1677',
  defaultConfig: {
    lutType: 'full',
    temperature: {
      ranges: [
        { min: -10, max: 0, lutAdjustment: 0.1 },
        { min: 0, max: 25, lutAdjustment: 0 },
        { min: 25, max: 40, lutAdjustment: -0.1 },
      ]
    }
  },
  voltageRanges: {
    vsh: { min: 10.0, max: 20.0, step: 0.1 },
    vsl: { min: -20.0, max: -10.0, step: 0.1 },
    vgh: { min: 15.0, max: 25.0, step: 0.1 },
    vgl: { min: -25.0, max: -15.0, step: 0.1 },
  },
};

export const DRIVER_CONFIGS: Record<string, DriverICConfig> = {
  ssd1677: SSD1677_CONFIG,
};

export const getDriverConfig = (id: string): DriverICConfig | undefined => {
  return DRIVER_CONFIGS[id];
};

export const getAllDriverConfigs = (): DriverICConfig[] => {
  return Object.values(DRIVER_CONFIGS);
};
