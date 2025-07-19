import { useState, useMemo } from 'react';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Autocomplete, AutocompleteItem } from '@heroui/autocomplete';
import { Button } from '@heroui/button';
import { Project, VoltageSettings } from '@/types';
import { getAllDriverConfigs, getDriverConfig } from '@/config/drivers';

interface ProjectSettingsProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Partial<Project>) => void;
}

export default function ProjectSettings({ project, onProjectUpdate }: ProjectSettingsProps) {
  // Get available driver configurations
  const driverConfigs = getAllDriverConfigs();
  const currentDriverConfig = getDriverConfig(project.chipModel);

  // Get available voltage options (in mV from functions)
  const availableVoltages = useMemo(() => {
    if (!currentDriverConfig) return null;
    
    return {
      vgh: currentDriverConfig.getVGHList ? currentDriverConfig.getVGHList() : [],
      vsh: currentDriverConfig.getVSHList ? currentDriverConfig.getVSHList() : [],
      vsl: currentDriverConfig.getVSLList ? currentDriverConfig.getVSLList() : [],
      vshr: currentDriverConfig.getVSHRList ? currentDriverConfig.getVSHRList() : [],
    };
  }, [currentDriverConfig]);

  // Project basic info state
  const [projectInfo, setProjectInfo] = useState({
    name: project.name,
    chipModel: project.chipModel
  });

  // Helper functions for unit conversion
  const mvToV = (mv: number) => mv / 1000;

  // Helper function to find index of default value in voltage list
  const findDefaultIndex = (list: number[], defaultValue: number): number => {
    const index = list.findIndex(value => value === defaultValue);
    return index >= 0 ? index : 0; // fallback to first item if not found
  };

  // Default voltage settings (indices for lists based on driver config defaults)
  const defaultVoltageSettings: VoltageSettings = useMemo(() => {
    if (!currentDriverConfig || !availableVoltages) {
      return {
        vgh: 0, vgl: 0, vsh: 0, vshr: 0, vsl: 0, vcom: -1.5
      };
    }

    const vghIndex = findDefaultIndex(availableVoltages.vgh, currentDriverConfig.defaultVGH);
    const vshIndex = findDefaultIndex(availableVoltages.vsh, currentDriverConfig.defaultVSH);
    const vslIndex = findDefaultIndex(availableVoltages.vsl, currentDriverConfig.defaultVSL);
    const vshrIndex = findDefaultIndex(availableVoltages.vshr, currentDriverConfig.defaultVSHR);

    return {
      vgh: vghIndex,
      vgl: vghIndex, // VGL使用与VGH相同的索引
      vsh: vshIndex,
      vshr: vshrIndex,
      vsl: vslIndex,
      vcom: -1.5, // VCOM保持为实际值
    };
  }, [currentDriverConfig, availableVoltages]);

  const [voltageSettings, setVoltageSettings] = useState<VoltageSettings>(() => {
    if (project.config?.voltageSettings) {
      // 如果项目已有配置，使用项目配置，但确保VGL = VGH索引
      const settings = project.config.voltageSettings;
      return {
        ...settings,
        vgl: settings.vgh // 确保VGL使用VGH的索引
      };
    }
    // 如果没有项目配置，使用默认值
    return defaultVoltageSettings;
  });

  const handleVoltageChange = (field: keyof VoltageSettings, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setVoltageSettings(prev => {
        const newSettings = {
          ...prev,
          [field]: numValue
        };
        
        // 如果修改的是VGH，自动设置VGL = -VGH
        if (field === 'vgh') {
          newSettings.vgl = -numValue;
        }
        
        return newSettings;
      });
    }
  };

  const handleProjectInfoChange = (field: 'name' | 'chipModel', value: string) => {
    setProjectInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save both project info and voltage settings
    const updatedProject = {
      name: projectInfo.name,
      chipModel: projectInfo.chipModel as 'ssd1677',
      updatedTime: new Date().toISOString(),
      config: {
        voltageSettings: voltageSettings,
        type: project.config?.type || 0, // 默认为 LUTType.BW (0)
        ...project.config,
      }
    };
    
    if (onProjectUpdate) {
      onProjectUpdate(updatedProject);
    }
    
    console.log('保存项目设置:', {
      projectInfo,
      voltageSettings
    });
  };

  const handleReset = () => {
    // Reset to original project values and default voltage settings
    setProjectInfo({
      name: project.name,
      chipModel: project.chipModel
    });
    
    const resetSettings = project.config?.voltageSettings || defaultVoltageSettings;
    // 确保VGL使用VGH的索引
    setVoltageSettings({
      ...resetSettings,
      vgl: resetSettings.vgh // 使用相同的索引
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Project Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">项目信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="项目名称"
            value={projectInfo.name}
            onChange={(e) => handleProjectInfoChange('name', e.target.value)}
            variant="flat"
            classNames={{
              base: "transition-all duration-200",
              inputWrapper: "bg-default-50 hover:bg-default-100 data-[focus=true]:bg-default-50",
            }}
          />
          <Select
            label="芯片型号"
            placeholder="选择芯片型号"
            selectedKeys={[projectInfo.chipModel]}
            onSelectionChange={(keys: any) => {
              const key = Array.from(keys)[0] as string;
              handleProjectInfoChange('chipModel', key);
            }}
            variant="flat"
            classNames={{
              base: "transition-all duration-200",
              trigger: "bg-default-50 hover:bg-default-100 data-[focus=true]:bg-default-50",
            }}
          >
            {driverConfigs.map((config) => (
              <SelectItem key={config.id}>
                {config.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Voltage Settings */}
      <div className="space-y-8">
        <h3 className="text-lg font-semibold text-foreground">驱动电压设置</h3>
        
        {/* Gate Voltages */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-default-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-purple-500"></div>
            栅极电压 (Gate Voltages)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Autocomplete
              label="VGH (Gate High)"
              placeholder="输入或选择栅极高电压"
              defaultItems={availableVoltages?.vgh.map((voltage, index) => ({
                key: index.toString(),
                label: mvToV(voltage).toFixed(1),
                value: index.toString()
              })) || []}
              selectedKey={voltageSettings.vgh.toString()}
              onSelectionChange={(key) => {
                const selectedIndex = parseInt(key as string);
                if (!isNaN(selectedIndex)) {
                  const vghValue = availableVoltages?.vgh[selectedIndex];
                  if (vghValue) {
                    // VGH选择后，自动设置VGL为相反数的索引
                    setVoltageSettings(prev => ({
                      ...prev,
                      vgh: selectedIndex,
                      vgl: selectedIndex // VGL使用相同的索引，但显示为负值
                    }));
                  }
                }
              }}
              variant="flat"
              endContent={<span className="text-small text-default-400">V</span>}
              allowsCustomValue={false}
              classNames={{
                base: "transition-all duration-200",
              }}
            >
              {(item) => (
                <AutocompleteItem key={item.key}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
            
            <Input
              label="VGL (Gate Low)"
              value={availableVoltages?.vgh ? `-${mvToV(availableVoltages.vgh[voltageSettings.vgh] || 0).toFixed(1)}` : '-20.0'}
              endContent={<span className="text-small text-default-400">V</span>}
              isReadOnly
              isDisabled
              variant="flat"
              classNames={{
                base: "transition-all duration-200",
                inputWrapper: "bg-default-100 data-[disabled=true]:opacity-60",
                description: "text-xs",
              }}
            />
          </div>
        </div>

        {/* Source Voltages */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-default-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-blue-500"></div>
            源极电压 (Source Voltages)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Autocomplete
              label="VSH (Source High)"
              placeholder="输入或选择源极高电压"
              defaultItems={availableVoltages?.vsh.map((voltage, index) => ({
                key: index.toString(),
                label: mvToV(voltage).toFixed(1),
                value: index.toString()
              })) || []}
              selectedKey={voltageSettings.vsh.toString()}
              onSelectionChange={(key) => {
                const selectedIndex = parseInt(key as string);
                if (!isNaN(selectedIndex)) {
                  setVoltageSettings(prev => ({
                    ...prev,
                    vsh: selectedIndex
                  }));
                }
              }}
              variant="flat"
              endContent={<span className="text-small text-default-400">V</span>}
              allowsCustomValue={false}
              classNames={{
                base: "transition-all duration-200",
              }}
            >
              {(item) => (
                <AutocompleteItem key={item.key}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
            
            <Autocomplete
              label="VSHR (Source High Ref)"
              placeholder="输入或选择源极高参考电压"
              defaultItems={availableVoltages?.vshr.map((voltage, index) => ({
                key: index.toString(),
                label: mvToV(voltage).toFixed(1),
                value: index.toString()
              })) || []}
              selectedKey={voltageSettings.vshr.toString()}
              onSelectionChange={(key) => {
                const selectedIndex = parseInt(key as string);
                if (!isNaN(selectedIndex)) {
                  setVoltageSettings(prev => ({
                    ...prev,
                    vshr: selectedIndex
                  }));
                }
              }}
              variant="flat"
              endContent={<span className="text-small text-default-400">V</span>}
              allowsCustomValue={false}
              classNames={{
                base: "transition-all duration-200",
              }}
            >
              {(item) => (
                <AutocompleteItem key={item.key}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
            
            <Autocomplete
              label="VSL (Source Low)"
              placeholder="输入或选择源极低电压"
              defaultItems={availableVoltages?.vsl.map((voltage, index) => ({
                key: index.toString(),
                label: mvToV(voltage).toFixed(1),
                value: index.toString()
              })) || []}
              selectedKey={voltageSettings.vsl.toString()}
              onSelectionChange={(key) => {
                const selectedIndex = parseInt(key as string);
                if (!isNaN(selectedIndex)) {
                  setVoltageSettings(prev => ({
                    ...prev,
                    vsl: selectedIndex
                  }));
                }
              }}
              variant="flat"
              startContent={<span className="text-small text-default-400">-</span>}
              endContent={<span className="text-small text-default-400">V</span>}
              allowsCustomValue={false}
              classNames={{
                base: "transition-all duration-200",
              }}
            >
              {(item) => (
                <AutocompleteItem key={item.key}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>
        </div>

        {/* VCOM Voltage */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-default-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-green-500"></div>
            公共电压 (VCOM)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="VCOM"
              type="number"
              value={voltageSettings.vcom.toString()}
              onChange={(e) => handleVoltageChange('vcom', e.target.value)}
              endContent={<span className="text-small text-default-400">V</span>}
              description="范围: -3V ~ 0V"
              variant="flat"
              classNames={{
                base: "transition-all duration-200",
                inputWrapper: "hover:shadow-sm bg-default-50 data-[focus=true]:bg-default-50",
                description: "text-xs",
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          variant="flat"
          onClick={handleReset}
          className="transition-all duration-200"
        >
          重置默认值
        </Button>
        <Button
          color="primary"
          onClick={handleSave}
          className="transition-all duration-200"
        >
          保存设置
        </Button>
      </div>
    </div>
  );
}
