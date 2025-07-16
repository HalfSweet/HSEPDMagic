import { useState, useMemo } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Tooltip } from '@heroui/tooltip';
import { Project } from '@/types';
interface WaveformEditorProps {
  project: Project;
  onCodeGenerate: (code: string) => void;
}

// LUT波形类型定义
type WaveformType = 'LUTW' | 'LUTB' | 'LUTW2' | 'VCOM';
type VoltageLevel = 0 | 1 | 2 | 3; // 对应不同电压级别
type SubPhase = 'S1_1' | 'S1_2' | 'S2_1' | 'S2_2'; // 四个子相位

interface GroupConfig {
  id: number;
  name: string;
  frames: number;
  grp: number; // G_RP值，通常为0
  freq: number; // 帧频率
  waveforms: {
    [key in WaveformType]: {
      [key in SubPhase]: VoltageLevel[];
    };
  };
}

// 基于Excel参考图的SSD1677 LUT预设数据
const DEFAULT_LUT_CONFIG: GroupConfig[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Group${i + 1}`,
  frames: i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1)), // 参考图中的帧数分布
  grp: 0,
  freq: 50,
  waveforms: {
    LUTW: {
      S1_1: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill(i % 2),
      S1_2: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill((i + 1) % 3),
      S2_1: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill(i % 4),
      S2_2: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill((i + 2) % 3),
    },
    LUTB: {
      S1_1: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill((i + 1) % 4),
      S1_2: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill(i % 3),
      S2_1: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill((i + 2) % 4),
      S2_2: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill((i + 3) % 3),
    },
    LUTW2: {
      S1_1: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill(i % 3),
      S1_2: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill((i + 2) % 4),
      S2_1: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill((i + 1) % 3),
      S2_2: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill(i % 4),
    },
    VCOM: {
      S1_1: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill(1),
      S1_2: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill(1),
      S2_1: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill(1),
      S2_2: Array(i === 0 ? 12 : (i === 1 ? 4 : (i === 2 ? 2 : 1))).fill(1),
    },
  },
}));

export default function WaveformEditor({ project, onCodeGenerate }: WaveformEditorProps) {
  const [lutConfig, setLutConfig] = useState<GroupConfig[]>(DEFAULT_LUT_CONFIG);

  // 电压级别到颜色的映射（基于Excel参考图）
  const getVoltageColor = (level: VoltageLevel): string => {
    switch (level) {
      case 0: return 'bg-gray-100 border-gray-300'; // 白色/灰色
      case 1: return 'bg-red-400 border-red-500'; // 红色
      case 2: return 'bg-blue-400 border-blue-500'; // 蓝色
      case 3: return 'bg-green-400 border-green-500'; // 绿色
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  // 电压级别到显示文本的映射
  const getVoltageText = (level: VoltageLevel): string => {
    switch (level) {
      case 0: return '0';
      case 1: return '1';
      case 2: return '2';
      case 3: return '3';
      default: return '0';
    }
  };

  // 更新电压值
  const updateVoltage = (
    groupId: number, 
    waveform: WaveformType, 
    subPhase: SubPhase, 
    frameIndex: number, 
    value: VoltageLevel
  ) => {
    setLutConfig(prev => 
      prev.map(group => 
        group.id === groupId 
          ? {
              ...group,
              waveforms: {
                ...group.waveforms,
                [waveform]: {
                  ...group.waveforms[waveform],
                  [subPhase]: group.waveforms[waveform][subPhase].map((v, i) => 
                    i === frameIndex ? value : v
                  )
                }
              }
            }
          : group
      )
    );
  };

  // 更新帧数
  const updateFrames = (groupId: number, newFrames: number) => {
    if (newFrames < 1) return;
    
    setLutConfig(prev =>
      prev.map(group =>
        group.id === groupId
          ? {
              ...group,
              frames: newFrames,
              waveforms: Object.keys(group.waveforms).reduce((acc, waveform) => ({
                ...acc,
                [waveform]: Object.keys(group.waveforms[waveform as WaveformType]).reduce((subAcc, subPhase) => ({
                  ...subAcc,
                  [subPhase]: Array(newFrames).fill(0).map((_, i) => 
                    i < group.waveforms[waveform as WaveformType][subPhase as SubPhase].length 
                      ? group.waveforms[waveform as WaveformType][subPhase as SubPhase][i] 
                      : 0
                  )
                }), {})
              }), {}) as GroupConfig['waveforms']
            }
          : group
      )
    );
  };

  // 更新频率
  const updateFreq = (groupId: number, newFreq: number) => {
    setLutConfig(prev =>
      prev.map(group =>
        group.id === groupId ? { ...group, freq: newFreq } : group
      )
    );
  };

  // 生成C代码
  const generateCCode = () => {
    let code = `// SSD1677 LUT Configuration for ${project.name}\n`;
    code += `// Generated by HS EPD Magic\n\n`;
    
    // 生成每个Group的LUT数据
    lutConfig.forEach((group) => {
      code += `// Group ${group.id} Configuration\n`;
      code += `#define GROUP${group.id}_FRAMES ${group.frames}\n`;
      code += `#define GROUP${group.id}_FREQ ${group.freq}\n\n`;
      
      // 生成波形数据
      Object.entries(group.waveforms).forEach(([waveform, subPhases]) => {
        Object.entries(subPhases).forEach(([subPhase, data]) => {
          const arrayName = `group${group.id}_${waveform}_${subPhase}`;
          code += `static const uint8_t ${arrayName}[${group.frames}] = {\n    `;
          code += (data as VoltageLevel[]).map(val => `0x${val.toString(16).toUpperCase().padStart(2, '0')}`).join(', ');
          code += `\n};\n`;
        });
      });
      code += '\n';
    });

    code += `// LUT Configuration Structure\n`;
    code += `typedef struct {\n`;
    code += `    uint8_t frames;\n`;
    code += `    uint16_t freq;\n`;
    code += `    const uint8_t* lutw_s1_1;\n`;
    code += `    const uint8_t* lutw_s1_2;\n`;
    code += `    const uint8_t* lutw_s2_1;\n`;
    code += `    const uint8_t* lutw_s2_2;\n`;
    code += `    const uint8_t* lutb_s1_1;\n`;
    code += `    const uint8_t* lutb_s1_2;\n`;
    code += `    const uint8_t* lutb_s2_1;\n`;
    code += `    const uint8_t* lutb_s2_2;\n`;
    code += `    const uint8_t* lutw2_s1_1;\n`;
    code += `    const uint8_t* lutw2_s1_2;\n`;
    code += `    const uint8_t* lutw2_s2_1;\n`;
    code += `    const uint8_t* lutw2_s2_2;\n`;
    code += `    const uint8_t* vcom_s1_1;\n`;
    code += `    const uint8_t* vcom_s1_2;\n`;
    code += `    const uint8_t* vcom_s2_1;\n`;
    code += `    const uint8_t* vcom_s2_2;\n`;
    code += `} lut_group_config_t;\n\n`;

    onCodeGenerate(code);
  };

  // 计算总时间
  const totalTime = useMemo(() => {
    return lutConfig.reduce((total, group) => {
      return total + (group.frames / group.freq * 1000);
    }, 0);
  }, [lutConfig]);

  const maxFrames = Math.max(...lutConfig.map(g => g.frames));

  return (
    <div className="space-y-8">
      {/* 头部控制栏 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            SSD1677 LUT 波形编辑器
          </h3>
          <p className="text-small text-default-500 mt-1">
            {project.name} - 10组波形配置
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="flat"
            size="sm"
            onClick={() => {/* TODO: 导入C代码 */}}
          >
            导入C代码
          </Button>
          <Button
            color="primary"
            size="sm"
            onClick={generateCCode}
          >
            生成C代码
          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-default-50 rounded-xl">
        <div className="text-center group hover:scale-105 transition-transform duration-200">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{lutConfig.reduce((sum, g) => sum + g.frames, 0)}</div>
          <div className="text-xs text-default-500 group-hover:text-blue-500 transition-colors">总帧数</div>
        </div>
        <div className="text-center group hover:scale-105 transition-transform duration-200">
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{totalTime.toFixed(1)}ms</div>
          <div className="text-xs text-default-500 group-hover:text-purple-500 transition-colors">总时长</div>
        </div>
        <div className="text-center group hover:scale-105 transition-transform duration-200">
          <div className="text-xl font-bold text-green-600 dark:text-green-400">{lutConfig.filter(g => g.frames > 0).length}</div>
          <div className="text-xs text-default-500 group-hover:text-green-500 transition-colors">活跃组</div>
        </div>
        <div className="text-center group hover:scale-105 transition-transform duration-200">
          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{maxFrames}</div>
          <div className="text-xs text-default-500 group-hover:text-orange-500 transition-colors">最大帧数</div>
        </div>
        <div className="text-center group hover:scale-105 transition-transform duration-200">
          <div className="text-xl font-bold text-red-600 dark:text-red-400">50Hz</div>
          <div className="text-xs text-default-500 group-hover:text-red-500 transition-colors">平均频率</div>
        </div>
      </div>

      {/* 主要LUT表格 */}
      <Card className="border-0 shadow-lg">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-fit">
              {/* 组头部 */}
              <div className="flex border-b-2 border-gradient-to-r from-blue-200 to-purple-200 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20">
                <div className="w-24 border-r border-default-200 p-3 text-center font-bold text-default-700 bg-gradient-to-b from-white to-slate-50 dark:from-gray-800 dark:to-gray-900">
                  Group
                </div>
                {lutConfig.map((group) => (
                  <div key={group.id} className="border-r border-default-200 bg-gradient-to-b from-white to-slate-50 dark:from-gray-800 dark:to-gray-900">
                    <div className="flex">
                      {['S1.1', 'S1.2', 'S2.1', 'S2.2'].map((subPhase) => (
                        <div key={subPhase} className={`w-20 p-2 text-center border-r border-default-300 last:border-r-0 transition-all duration-200 hover:bg-gradient-to-b hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20`}>
                          <div className="text-xs font-bold text-default-700">{group.name}</div>
                          <div className="text-xs text-default-500">{subPhase}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* G_RP行 */}
              <div className="flex border-b border-default-200 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10">
                <div className="w-24 border-r border-default-200 p-3 text-center font-bold text-orange-700 dark:text-orange-400">
                  G_RP
                </div>
                {lutConfig.map((group) => (
                  <div key={group.id} className="border-r border-default-200">
                    <div className="flex">
                      {['S1_1', 'S1_2', 'S2_1', 'S2_2'].map((subPhase) => (
                        <div key={subPhase} className="w-20 p-2 text-center border-r border-default-300 last:border-r-0 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors duration-200">
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">0</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* 帧数行 */}
              <div className="flex border-b border-default-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
                <div className="w-24 border-r border-default-200 p-3 text-center font-bold text-blue-700 dark:text-blue-400">
                  Frames
                </div>
                {lutConfig.map((group) => (
                  <div key={group.id} className="border-r border-default-200">
                    <div className="flex">
                      <div className="w-80 p-2 text-center">
                        <Input
                          size="sm"
                          type="number"
                          value={group.frames.toString()}
                          onChange={(e) => updateFrames(group.id, parseInt(e.target.value) || 1)}
                          min={1}
                          max={255}
                          className="text-center"
                          classNames={{
                            input: "text-center text-sm font-medium",
                            inputWrapper: "h-8 min-h-8 bg-white dark:bg-gray-800 border-1 border-blue-200 hover:border-blue-400 focus-within:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 波形数据行 */}
              {(['LUTW', 'LUTB', 'LUTW2', 'VCOM'] as WaveformType[]).map((waveform) => (
                <div key={waveform} className={`flex border-b border-default-200 ${
                  waveform === 'LUTW' ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10' :
                  waveform === 'LUTB' ? 'bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10' :
                  waveform === 'LUTW2' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10' :
                  'bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10'
                }`}>
                  <div className="w-24 border-r border-default-200 p-3 text-center font-bold text-default-700 bg-gradient-to-b from-white/80 to-default-100/80 dark:from-gray-800 dark:to-gray-900">
                    {waveform}
                  </div>
                  {lutConfig.map((group) => (
                    <div key={group.id} className="border-r border-default-200">
                      <div className="flex">
                        {(['S1_1', 'S1_2', 'S2_1', 'S2_2'] as SubPhase[]).map((subPhase) => (
                          <div key={subPhase} className="w-20 border-r border-default-300 last:border-r-0">
                            <div className="grid grid-cols-1 gap-0">
                              {group.waveforms[waveform][subPhase].slice(0, Math.min(group.frames, 12)).map((voltage, frameIndex) => (
                                <Tooltip 
                                  key={frameIndex}
                                  content={`${waveform} ${subPhase} Frame ${frameIndex + 1}: Level ${voltage}`}
                                  className="text-xs"
                                  placement="top"
                                >
                                  <button
                                    className={`h-8 w-full border-b border-white/20 ${getVoltageColor(voltage)} hover:scale-105 hover:shadow-lg transition-all duration-200 text-xs font-bold text-white relative group`}
                                    onClick={() => {
                                      const nextLevel = ((voltage + 1) % 4) as VoltageLevel;
                                      updateVoltage(group.id, waveform, subPhase, frameIndex, nextLevel);
                                    }}
                                  >
                                    <span className="relative z-10">{getVoltageText(voltage)}</span>
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                  </button>
                                </Tooltip>
                              ))}
                              {/* 如果帧数超过12，显示省略号 */}
                              {group.frames > 12 && (
                                <div className="h-8 bg-gradient-to-b from-default-100 to-default-200 flex items-center justify-center text-xs text-default-500 font-medium border-b border-white/20">
                                  ⋯
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* 频率行 */}
              <div className="flex bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10">
                <div className="w-24 border-r border-default-200 p-3 text-center font-bold text-yellow-700 dark:text-yellow-400">
                  FREQ
                </div>
                {lutConfig.map((group) => (
                  <div key={group.id} className="border-r border-default-200">
                    <div className="flex">
                      <div className="w-80 p-2 text-center">
                        <Input
                          size="sm"
                          type="number"
                          value={group.freq.toString()}
                          onChange={(e) => updateFreq(group.id, parseInt(e.target.value) || 50)}
                          min={1}
                          max={1000}
                          className="text-center"
                          endContent={<span className="text-xs text-default-400">Hz</span>}
                          classNames={{
                            input: "text-center text-sm font-medium",
                            inputWrapper: "h-8 min-h-8 bg-white dark:bg-gray-800 border-1 border-yellow-200 hover:border-yellow-400 focus-within:border-yellow-500 shadow-sm hover:shadow-md transition-all duration-200"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 图例和说明 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            电压级别图例
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-default-50 hover:bg-default-100 transition-colors duration-200">
              <div className="w-5 h-5 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="font-medium">Level 0</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-default-50 hover:bg-default-100 transition-colors duration-200">
              <div className="w-5 h-5 bg-red-400 border border-red-500 rounded"></div>
              <span className="font-medium">Level 1</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-default-50 hover:bg-default-100 transition-colors duration-200">
              <div className="w-5 h-5 bg-blue-400 border border-blue-500 rounded"></div>
              <span className="font-medium">Level 2</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-default-50 hover:bg-default-100 transition-colors duration-200">
              <div className="w-5 h-5 bg-green-400 border border-green-500 rounded"></div>
              <span className="font-medium">Level 3</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            操作说明
          </h3>
          <div className="space-y-3">
            {[
              "点击电压单元格可循环切换0-3级别",
              "调整帧数会自动调整波形数据长度", 
              "G_RP行固定为0（SSD1677要求）",
              "FREQ设置每组的刷新频率"
            ].map((tip, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-default-50 hover:bg-default-100 transition-colors duration-200">
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                <span className="text-sm text-default-600">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
