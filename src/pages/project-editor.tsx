import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab } from '@heroui/tabs';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { ArrowLeftIcon } from '@heroui/shared-icons';
import { useProjectManager } from '@/hooks/useProjectManager';
import DefaultLayout from '@/layouts/default';
import ProjectSettings from '@/components/project-settings';
import WaveformEditor from '@/components/waveform-editor';
import CodePreview from '@/components/code-preview';

export default function ProjectEditor() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getProject } = useProjectManager();
  
  const [activeTab, setActiveTab] = useState('waveform');
  
  const project = projectId ? getProject(projectId) : null;

  if (!project) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">项目未找到</h1>
            <Button onClick={() => navigate('/')}>返回首页</Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const handleBack = () => {
    navigate('/');
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-6 max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="flat"
              size="sm"
              startContent={<ArrowLeftIcon />}
              onClick={handleBack}
            >
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-default-500">芯片型号: {t('driver.ssd1677')}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button color="primary" variant="bordered">
              导入C代码
            </Button>
            <Button color="primary">
              导出C代码
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-6">
          {/* Tabs */}
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12",
            }}
          >
            <Tab key="waveform" title="波形配置">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
                {/* Waveform Editor - Takes 3/4 of the space on large screens */}
                <div className="xl:col-span-3">
                  <WaveformEditor project={project} />
                </div>
                
                {/* Code Preview - Takes 1/4 of the space on large screens */}
                <div className="xl:col-span-1">
                  <CodePreview project={project} />
                </div>
              </div>
            </Tab>
            
            <Tab key="settings" title="工程设置">
              <div className="mt-6">
                <ProjectSettings project={project} />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </DefaultLayout>
  );
}
