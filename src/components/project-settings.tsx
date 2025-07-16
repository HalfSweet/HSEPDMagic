import { useState } from 'react';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Button } from '@heroui/button';
import { Project, VoltageSettings } from '@/types';
import { getAllDriverConfigs } from '@/config/drivers';

interface ProjectSettingsProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Partial<Project>) => void;
}

export default function ProjectSettings({ project, onProjectUpdate }: ProjectSettingsProps) {
  // Get available driver configurations
  const driverConfigs = getAllDriverConfigs();

  // Project basic info state
  const [projectInfo, setProjectInfo] = useState({
    name: project.name,
    chipModel: project.chipModel
  });

  // Default voltage settings based on SSD1677 specifications
  const defaultVoltageSettings: VoltageSettings = {
    vgh: 20.0,   // Gate High Voltage (10V ~ 25V)
    vgl: -20.0,  // Gate Low Voltage (-25V ~ -15V)
    vsh: 15.0,   // Source High Voltage (10V ~ 20V)
    vshr: 4.0,   // Source High Voltage Reference (0V ~ 10V)
    vsl: -15.0,  // Source Low Voltage (-20V ~ -10V)
    vcom: -1.5,  // VCOM Voltage (-3V ~ 0V)
  };

  const [voltageSettings, setVoltageSettings] = useState<VoltageSettings>(
    project.config?.voltageSettings || defaultVoltageSettings
  );

  const handleVoltageChange = (field: keyof VoltageSettings, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setVoltageSettings(prev => ({
        ...prev,
        [field]: numValue
      }));
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
        ...project.config,
        voltageSettings: voltageSettings
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
    
    setVoltageSettings(project.config?.voltageSettings || defaultVoltageSettings);
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
            <Input
              label="VGH (Gate High)"
              type="number"
              value={voltageSettings.vgh.toString()}
              onChange={(e) => handleVoltageChange('vgh', e.target.value)}
              endContent={<span className="text-small text-default-400">V</span>}
              description="范围: 10V ~ 25V"
              variant="flat"
              classNames={{
                base: "transition-all duration-200",
                inputWrapper: "hover:shadow-sm bg-default-50 data-[focus=true]:bg-default-50",
                description: "text-xs",
              }}
            />
            
            <Input
              label="VGL (Gate Low)"
              type="number"
              value={voltageSettings.vgl.toString()}
              onChange={(e) => handleVoltageChange('vgl', e.target.value)}
              endContent={<span className="text-small text-default-400">V</span>}
              description="范围: -25V ~ -15V"
              variant="flat"
              classNames={{
                base: "transition-all duration-200",
                inputWrapper: "hover:shadow-sm bg-default-50 data-[focus=true]:bg-default-50",
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
            <Input
              label="VSH (Source High)"
              type="number"
              value={voltageSettings.vsh.toString()}
              onChange={(e) => handleVoltageChange('vsh', e.target.value)}
              endContent={<span className="text-small text-default-400">V</span>}
              description="范围: 10V ~ 20V"
              variant="flat"
              classNames={{
                base: "transition-all duration-200",
                inputWrapper: "hover:shadow-sm bg-default-50 data-[focus=true]:bg-default-50",
                description: "text-xs",
              }}
            />
            
            <Input
              label="VSHR (Source High Ref)"
              type="number"
              value={voltageSettings.vshr.toString()}
              onChange={(e) => handleVoltageChange('vshr', e.target.value)}
              endContent={<span className="text-small text-default-400">V</span>}
              description="范围: 0V ~ 10V"
              variant="flat"
              classNames={{
                base: "transition-all duration-200",
                inputWrapper: "hover:shadow-sm bg-default-50 data-[focus=true]:bg-default-50",
                description: "text-xs",
              }}
            />
            
            <Input
              label="VSL (Source Low)"
              type="number"
              value={voltageSettings.vsl.toString()}
              onChange={(e) => handleVoltageChange('vsl', e.target.value)}
              endContent={<span className="text-small text-default-400">V</span>}
              description="范围: -20V ~ -10V"
              variant="flat"
              classNames={{
                base: "transition-all duration-200",
                inputWrapper: "hover:shadow-sm bg-default-50 data-[focus=true]:bg-default-50",
                description: "text-xs",
              }}
            />
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
