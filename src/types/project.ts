export interface Project {
  id: string;
  name: string;
  chipModel: 'ssd1677';
  createdTime: string;
  updatedTime: string;
  config?: ProjectConfig;
}

export enum LUTType {
  BW,
  BWR,
}

export enum LUTPhaseType {
  VSS,
  VSH,
  VSL,
  VSHR,
}

export interface ProjectConfig {
  // SSD1677 specific configuration
  lutData?: LUTData;
  voltageSettings?: VoltageSettings;
  // Add more configuration fields as needed
  type: LUTType;
}

export interface VoltageSettings {
  // 下面的值均为对应返回值的index
  vgh: number;
  vgl: number;
  vsh: number;
  vshr: number;
  vsl: number;
  vcom: number;
}

export interface LUTData {
  groups: LUTGroup[];
}

export interface LUTGroup {
  phases: LUTPhase[];
  repeat: number;
}

export interface LUTStage {
  repeat: number;
}

export interface LUTPhase {
  type: LUTPhaseType;
  frameCount: number;
  stages?: LUTStage[];
}

export interface DriverICConfig {
  id: string;
  name: string;

  group: {
    phase: {
      count: number; // 每个group里面的phase数量
      hasTwoStages: boolean; // 是否有两阶段（俗称小循环）
      stages?: {
        repeatMax: number; // 每个阶段的最多重复次数
      }
      frameMax: number; // 每个phase的最多重复次数
    }
    count: number; // 每个IC里面最多包含的group数量
    repeatMax: number; // 每个IC里面group最多重复次数
  };

  getVGHList: () => number[];
  getVGLList?: () => number[];
  getVSHList: () => number[];
  getVSHRList: () => number[];
  getVSLList: () => number[];

  defaultVGH: number;
  defaultVGL?: number;
  defaultVSH: number;
  defaultVSHR: number;
  defaultVSL: number;
}
