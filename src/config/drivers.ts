import { DriverICConfig } from '@/types';

export const SSD1677_CONFIG: DriverICConfig = {
  id: 'ssd1677',
  name: 'SSD1677',
  group: {
    phase: {
      count: 4,
      hasTwoStages: false,
      frameMax: 255,
    },
    count: 10, 
    repeatMax: 255,
  },
  getVGHList: () => {
    let vgh07_17 = [];
    for (let i = 0x07; i <= 0x17; i += 1) {
      vgh07_17.push(12000 + (i - 0x07) * 500);
    }
    return [20000, ...vgh07_17];
  },
  getVSHList: () => {
    let b7_0 = [];
    for (let i = 0x8E; i <= 0xCE; i += 1) {
      b7_0.push(2400 + (i - 0x8E) * 100);
    }
    let b7_1 = [];
    for (let i = 0x23; i <= 0x4B; i += 1) {
      b7_1.push(9000 + (i - 0x23) * 200);
    }
    return [...b7_1, ...b7_0];
  },
  getVSLList: () => {
    let vsl = [];
    for (let i = 0x1A; i <= 0x3A; i += 1) {
      vsl.push(9000 + (i - 0x1A) * 500);
    }
    return vsl;
  },
  getVSHRList: () => {
    let vshr = [];
    for (let i = 0x8E; i <= 0xCE; i += 1) {
      vshr.push(2400 + (i - 0x8E) * 100);
    }
    return vshr;
  },
  defaultVGH: 20000,
  defaultVSH: 15000,
  defaultVSL: 15000,
  defaultVSHR: 5000,
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
