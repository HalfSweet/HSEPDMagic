import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@heroui/button';
import { Tabs, Tab } from '@heroui/tabs';
import { Chip } from '@heroui/chip';
import DefaultLayout from '@/layouts/default';
import ProjectSettings from '@/components/project-settings';
import WaveformEditor from '@/components/waveform-editor';
import CodePreview from '@/components/code-preview';
import { Project } from '@/types';
import { useProjectManager } from '@/hooks/useProjectManager';

export default function ProjectDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id');
  
  console.log('项目详情页面渲染, URL参数:', Object.fromEntries(searchParams.entries()));
  console.log('提取的项目ID:', projectId);
  
  const { getProject, loading } = useProjectManager();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<string>('waveform');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [showCodePreview, setShowCodePreview] = useState<boolean>(false);

  useEffect(() => {
    console.log('项目详情页面加载, projectId:', projectId, 'loading:', loading);
    
    if (projectId) {
      console.log('查找项目:', projectId);
      
      // 如果还在加载中，等待加载完成
      if (loading) {
        console.log('项目数据还在加载中，等待...');
        return;
      }
      
      const foundProject = getProject(projectId);
      console.log('找到的项目:', foundProject);
      
      if (foundProject) {
        setProject(foundProject);
        console.log('项目设置成功:', foundProject.name);
      } else {
        console.warn('项目不存在，返回项目管理页面');
        // 项目不存在，返回项目管理页面
        navigate('/project-manager');
      }
    } else {
      console.warn('没有项目ID，返回项目管理页面');
      navigate('/project-manager');
    }
  }, [projectId, getProject, navigate, loading]);

  const handleCodeGenerate = (code: string) => {
    setGeneratedCode(code);
    setShowCodePreview(true);
  };

  const handleCodePreviewClose = () => {
    setShowCodePreview(false);
  };

  if (!project) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">加载中...</h2>
            <p className="text-default-500">正在加载项目数据</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {/* 项目头部信息 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {project.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Chip 
                  size="sm" 
                  variant="flat" 
                  color="primary"
                  className="text-xs"
                >
                  {project.chipModel.toUpperCase()}
                </Chip>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="light"
              size="sm"
              onClick={() => navigate('/project-manager')}
              className="transition-all duration-200"
            >
              返回项目列表
            </Button>
            <Button
              color="primary"
              size="sm"
              onClick={() => setShowCodePreview(true)}
              isDisabled={!generatedCode}
              className="transition-all duration-200"
            >
              查看代码
            </Button>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="min-h-screen">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="light"
            className="w-full"
            classNames={{
              tabList: "gap-6 w-full relative rounded-xl bg-default-100 p-1",
              panel: "w-full mt-6",
              tab: "max-w-fit px-6 py-3 h-12 rounded-lg transition-all duration-200",
              tabContent: "group-data-[selected=true]:text-white",
              cursor: "w-full bg-primary shadow-lg rounded-lg"
            }}
          >
            {/* 波形编辑 Tab - 放在左边 */}
            <Tab
              key="waveform"
              title={
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                  <span className="font-medium">波形编辑</span>
                </div>
              }
            >
              <div className="space-y-8 bg-content1 rounded-xl p-8 shadow-small">
                <div>
                  <h2 className="text-2xl font-semibold mb-2 text-foreground">
                    LUT 波形配置
                  </h2>
                  <p className="text-default-500 mb-8">
                    可视化编辑 SSD1677 的查找表（LUT）波形数据，支持10组不同的刷新模式
                  </p>
                </div>
                <WaveformEditor 
                  project={project} 
                  onCodeGenerate={handleCodeGenerate}
                />
              </div>
            </Tab>

            {/* 工程设置 Tab - 放在右边 */}
            <Tab
              key="settings"
              title={
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                  <span className="font-medium">工程设置</span>
                </div>
              }
            >
              <div className="space-y-8 bg-content1 rounded-xl p-8 shadow-small">
                <div>
                  <h2 className="text-2xl font-semibold mb-2 text-foreground">
                    驱动参数配置
                  </h2>
                  <p className="text-default-500 mb-8">
                    配置 SSD1677 墨水屏驱动芯片的工作电压和相关参数
                  </p>
                </div>
                <ProjectSettings project={project} />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>

      {/* 代码预览对话框 */}
      {showCodePreview && (
        <CodePreview
          code={generatedCode}
          filename={`${project.name}_lut_config.c`}
          onClose={handleCodePreviewClose}
        />
      )}
    </DefaultLayout>
  );
}
