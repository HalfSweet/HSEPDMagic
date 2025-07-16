import { useState } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Project } from '@/types';

interface ProjectSettingsProps {
  project: Project;
}

interface VoltageSettings {
  vgh: number;  // Gate High Voltage
  vgl: number;  // Gate Low Voltage
  vsh: number;  // Source High Voltage
  vshr: number; // Source High Voltage Reference
  vsl: number;  // Source Low Voltage
  vcom: number; // VCOM Voltage
}

export default function ProjectSettings({ project }: ProjectSettingsProps) {
  // Default voltage settings based on SSD1677 specifications
  const [voltageSettings, setVoltageSettings] = useState<VoltageSettings>({
    vgh: 20.0,   // Gate High Voltage (10V ~ 25V)
    vgl: -20.0,  // Gate Low Voltage (-25V ~ -15V)
    vsh: 15.0,   // Source High Voltage (10V ~ 20V)
    vshr: 4.0,   // Source High Voltage Reference (0V ~ 10V)
    vsl: -15.0,  // Source Low Voltage (-20V ~ -10V)
    vcom: -1.5,  // VCOM Voltage (-3V ~ 0V)
  });

  const handleVoltageChange = (field: keyof VoltageSettings, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setVoltageSettings(prev => ({
        ...prev,
        [field]: numValue
      }));
    }
  };

  const handleSave = () => {
    // TODO: Save voltage settings to project config
    console.log('Saving voltage settings:', voltageSettings);
  };

  const handleReset = () => {
    // Reset to default values
    setVoltageSettings({
      vgh: 20.0,
      vgl: -20.0,
      vsh: 15.0,
      vshr: 4.0,
      vsl: -15.0,
      vcom: -1.5,
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
            value={project.name}
            isReadOnly
            variant="flat"
            classNames={{
              base: "transition-all duration-200",
              inputWrapper: "bg-default-50 hover:bg-default-100",
            }}
          />
          <Input
            label="芯片型号"
            value={project.chipModel.toUpperCase()}
            isReadOnly
            variant="flat"
            classNames={{
              base: "transition-all duration-200",
              inputWrapper: "bg-default-50 hover:bg-default-100",
            }}
          />
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
                inputWrapper: "hover:shadow-sm",
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
                inputWrapper: "hover:shadow-sm",
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
                inputWrapper: "hover:shadow-sm",
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
                inputWrapper: "hover:shadow-sm",
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
                inputWrapper: "hover:shadow-sm",
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
                inputWrapper: "hover:shadow-sm",
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
