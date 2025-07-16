import { useState, useMemo } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Tooltip } from '@heroui/tooltip';
import { Project } from '@/types';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
    <div className="w-full space-y-4">
      {/* 头部控制栏 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div>
              <h2 className="text-xl font-semibold">SSD1677 LUT 波形编辑器</h2>
              <p className="text-small text-default-500">
                {project.name} - 10组波形配置
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="bordered"
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
        </CardHeader>
        
        <CardBody>
          {/* 统计信息 */}
          <div className="grid grid-cols-5 gap-4 p-4 bg-default-50 rounded-lg mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{lutConfig.reduce((sum, g) => sum + g.frames, 0)}</div>
              <div className="text-xs text-default-500">总帧数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{totalTime.toFixed(1)}ms</div>
              <div className="text-xs text-default-500">总时长</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{lutConfig.filter(g => g.frames > 0).length}</div>
              <div className="text-xs text-default-500">活跃组</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{maxFrames}</div>
              <div className="text-xs text-default-500">最大帧数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">50Hz</div>
              <div className="text-xs text-default-500">平均频率</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 主要LUT表格 */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-fit">
              {/* 组头部 */}
              <div className="flex border-b-2 border-default-200 bg-default-100">
                <div className="w-20 border-r border-default-200 p-2 text-center font-semibold">
                  Group
                </div>
                {lutConfig.map((group) => (
                  <div key={group.id} className="border-r border-default-200">
                    <div className="flex">
                      {['S1.1', 'S1.2', 'S2.1', 'S2.2'].map((subPhase) => (
                        <div key={subPhase} className="w-16 p-1 text-center border-r border-default-300 last:border-r-0">
                          <div className="text-xs font-medium">{group.name}</div>
                          <div className="text-xs text-default-500">{subPhase}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* G_RP行 */}
              <div className="flex border-b border-default-200 bg-orange-50">
                <div className="w-20 border-r border-default-200 p-2 text-center font-medium">
                  G_RP
                </div>
                {lutConfig.map((group) => (
                  <div key={group.id} className="border-r border-default-200">
                    <div className="flex">
                      {['S1_1', 'S1_2', 'S2_1', 'S2_2'].map((subPhase) => (
                        <div key={subPhase} className="w-16 p-1 text-center border-r border-default-300 last:border-r-0">
                          <span className="text-sm">0</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* 帧数行 */}
              <div className="flex border-b border-default-200 bg-blue-50">
                <div className="w-20 border-r border-default-200 p-2 text-center font-medium">
                  Frames
                </div>
                {lutConfig.map((group) => (
                  <div key={group.id} className="border-r border-default-200">
                    <div className="flex">
                      <div className="w-64 p-1 text-center">
                        <Input
                          size="sm"
                          type="number"
                          value={group.frames.toString()}
                          onChange={(e) => updateFrames(group.id, parseInt(e.target.value) || 1)}
                          min={1}
                          max={255}
                          className="text-center"
                          classNames={{
                            input: "text-center text-sm",
                            inputWrapper: "h-7 min-h-7"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 波形数据行 */}
              {(['LUTW', 'LUTB', 'LUTW2', 'VCOM'] as WaveformType[]).map((waveform) => (
                <div key={waveform} className="flex border-b border-default-200">
                  <div className="w-20 border-r border-default-200 p-2 text-center font-medium bg-default-50">
                    {waveform}
                  </div>
                  {lutConfig.map((group) => (
                    <div key={group.id} className="border-r border-default-200">
                      <div className="flex">
                        {(['S1_1', 'S1_2', 'S2_1', 'S2_2'] as SubPhase[]).map((subPhase) => (
                          <div key={subPhase} className="w-16 border-r border-default-300 last:border-r-0">
                            <div className="grid grid-cols-1 gap-0">
                              {group.waveforms[waveform][subPhase].slice(0, Math.min(group.frames, 12)).map((voltage, frameIndex) => (
                                <Tooltip 
                                  key={frameIndex}
                                  content={`${waveform} ${subPhase} Frame ${frameIndex + 1}: Level ${voltage}`}
                                >
                                  <button
                                    className={`h-6 w-full border ${getVoltageColor(voltage)} hover:opacity-80 transition-opacity text-xs font-bold text-white`}
                                    onClick={() => {
                                      const nextLevel = ((voltage + 1) % 4) as VoltageLevel;
                                      updateVoltage(group.id, waveform, subPhase, frameIndex, nextLevel);
                                    }}
                                  >
                                    {getVoltageText(voltage)}
                                  </button>
                                </Tooltip>
                              ))}
                              {/* 如果帧数超过12，显示省略号 */}
                              {group.frames > 12 && (
                                <div className="h-6 bg-default-100 flex items-center justify-center text-xs text-default-500">
                                  ...
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
              <div className="flex bg-yellow-50">
                <div className="w-20 border-r border-default-200 p-2 text-center font-medium">
                  FREQ
                </div>
                {lutConfig.map((group) => (
                  <div key={group.id} className="border-r border-default-200">
                    <div className="flex">
                      <div className="w-64 p-1 text-center">
                        <Input
                          size="sm"
                          type="number"
                          value={group.freq.toString()}
                          onChange={(e) => updateFreq(group.id, parseInt(e.target.value) || 50)}
                          min={1}
                          max={1000}
                          className="text-center"
                          endContent={<span className="text-xs text-default-500">Hz</span>}
                          classNames={{
                            input: "text-center text-sm",
                            inputWrapper: "h-7 min-h-7"
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
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">电压级别图例</h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span>Level 0</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-400 border border-red-500 rounded"></div>
                  <span>Level 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 border border-blue-500 rounded"></div>
                  <span>Level 2</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 border border-green-500 rounded"></div>
                  <span>Level 3</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">操作说明</h3>
              <ul className="text-sm text-default-600 space-y-1">
                <li>• 点击电压单元格可循环切换0-3级别</li>
                <li>• 调整帧数会自动调整波形数据长度</li>
                <li>• G_RP行固定为0（SSD1677要求）</li>
                <li>• FREQ设置每组的刷新频率</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
