import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@heroui/card';
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
  const [activeTab, setActiveTab] = useState<string>('settings');
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
      <div className="space-y-6">
        {/* 项目头部信息 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Chip size="sm" variant="flat" color="primary">
                      {project.chipModel.toUpperCase()}
                    </Chip>
                    <Chip size="sm" variant="flat" color="secondary">
                      {project.lutType}
                    </Chip>
                    <span className="text-small text-default-500">
                      创建于 {new Date(project.createdTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="bordered"
                  size="sm"
                  onClick={() => navigate('/project-manager')}
                >
                  返回项目列表
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => setShowCodePreview(true)}
                  isDisabled={!generatedCode}
                >
                  查看代码
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 主要内容区域 */}
        <Card>
          <CardBody className="p-0">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              variant="underlined"
              className="w-full"
              classNames={{
                tabList: "px-6 pt-6",
                panel: "p-6 pt-4"
              }}
            >
              {/* 工程设置 Tab */}
              <Tab
                key="settings"
                title={
                  <div className="flex items-center gap-2">
                    <span>⚙️</span>
                    <span>工程设置</span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">SSD1677 驱动参数配置</h3>
                    <p className="text-sm text-default-500">
                      配置墨水屏驱动芯片的工作电压和相关参数
                    </p>
                  </div>
                  <ProjectSettings project={project} />
                </div>
              </Tab>

              {/* 波形编辑 Tab */}
              <Tab
                key="waveform"
                title={
                  <div className="flex items-center gap-2">
                    <span>📊</span>
                    <span>波形编辑</span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">LUT 波形配置</h3>
                    <p className="text-sm text-default-500">
                      可视化编辑SSD1677的查找表（LUT）波形数据，支持10组不同的刷新模式
                    </p>
                  </div>
                  <WaveformEditor 
                    project={project} 
                    onCodeGenerate={handleCodeGenerate}
                  />
                </div>
              </Tab>

              {/* 温度配置 Tab */}
              <Tab
                key="temperature"
                title={
                  <div className="flex items-center gap-2">
                    <span>🌡️</span>
                    <span>温度补偿</span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">温度补偿配置</h3>
                    <p className="text-sm text-default-500">
                      配置不同温度范围下的LUT参数调整
                    </p>
                  </div>
                  <Card>
                    <CardBody>
                      <div className="text-center py-8">
                        <p className="text-default-500">温度补偿功能正在开发中...</p>
                        <p className="text-sm text-default-400 mt-2">
                          将支持根据环境温度自动调整刷新参数
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </Tab>

              {/* 高级设置 Tab */}
              <Tab
                key="advanced"
                title={
                  <div className="flex items-center gap-2">
                    <span>🔧</span>
                    <span>高级设置</span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">高级配置选项</h3>
                    <p className="text-sm text-default-500">
                      专业用户的高级设置和调试选项
                    </p>
                  </div>
                  <Card>
                    <CardBody>
                      <div className="text-center py-8">
                        <p className="text-default-500">高级设置功能正在开发中...</p>
                        <p className="text-sm text-default-400 mt-2">
                          将包括时序调试、波形分析等功能
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>

        {/* 项目信息摘要 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-primary">SSD1677</div>
              <div className="text-sm text-default-500">驱动芯片</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-secondary">{project.lutType.toUpperCase()}</div>
              <div className="text-sm text-default-500">LUT类型</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-success">
                {new Date(project.updatedTime).toLocaleDateString()}
              </div>
              <div className="text-sm text-default-500">最后修改</div>
            </CardBody>
          </Card>
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
