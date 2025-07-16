import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Divider } from '@heroui/divider';
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
  const { t } = useTranslation();
  
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
    <div className="max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">工程设置</h2>
            <p className="text-small text-default-500">
              配置 {project.chipModel.toUpperCase()} 驱动电压参数
            </p>
          </div>
        </CardHeader>
        
        <CardBody className="gap-6">
          {/* Project Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">项目信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="项目名称"
                value={project.name}
                isReadOnly
                variant="bordered"
              />
              <Input
                label="芯片型号"
                value={project.chipModel.toUpperCase()}
                isReadOnly
                variant="bordered"
              />
            </div>
          </div>

          <Divider />

          {/* Voltage Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">驱动电压设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="VGH (Gate High)"
                type="number"
                value={voltageSettings.vgh.toString()}
                onChange={(e) => handleVoltageChange('vgh', e.target.value)}
                endContent="V"
                description="范围: 10V ~ 25V"
                variant="bordered"
              />
              
              <Input
                label="VGL (Gate Low)"
                type="number"
                value={voltageSettings.vgl.toString()}
                onChange={(e) => handleVoltageChange('vgl', e.target.value)}
                endContent="V"
                description="范围: -25V ~ -15V"
                variant="bordered"
              />
              
              <Input
                label="VSH (Source High)"
                type="number"
                value={voltageSettings.vsh.toString()}
                onChange={(e) => handleVoltageChange('vsh', e.target.value)}
                endContent="V"
                description="范围: 10V ~ 20V"
                variant="bordered"
              />
              
              <Input
                label="VSHR (Source High Ref)"
                type="number"
                value={voltageSettings.vshr.toString()}
                onChange={(e) => handleVoltageChange('vshr', e.target.value)}
                endContent="V"
                description="范围: 0V ~ 10V"
                variant="bordered"
              />
              
              <Input
                label="VSL (Source Low)"
                type="number"
                value={voltageSettings.vsl.toString()}
                onChange={(e) => handleVoltageChange('vsl', e.target.value)}
                endContent="V"
                description="范围: -20V ~ -10V"
                variant="bordered"
              />
              
              <Input
                label="VCOM"
                type="number"
                value={voltageSettings.vcom.toString()}
                onChange={(e) => handleVoltageChange('vcom', e.target.value)}
                endContent="V"
                description="范围: -3V ~ 0V"
                variant="bordered"
              />
            </div>
          </div>

          <Divider />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="bordered"
              onClick={handleReset}
            >
              重置默认值
            </Button>
            <Button
              color="primary"
              onClick={handleSave}
            >
              保存设置
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
