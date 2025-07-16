import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Tooltip } from '@heroui/tooltip';
import { useProjectManager } from '@/hooks/useProjectManager';
import { getAllDriverConfigs } from '@/config/drivers';
import DefaultLayout from '@/layouts/default';

export default function ProjectManager() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    projects,
    loading,
    createProject,
    deleteProject,
    exportProject,
    importProject,
  } = useProjectManager();

  const [formData, setFormData] = useState({
    name: '',
    chipModel: 'ssd1677' as const,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const driverConfigs = getAllDriverConfigs();

  const handleCreateProject = () => {
    console.log('开始创建项目:', formData);
    
    if (!formData.name.trim()) {
      console.warn('项目名称为空');
      // TODO: Add toast notification
      return;
    }

    const newProject = createProject({
      name: formData.name,
      chipModel: formData.chipModel,
    });

    console.log('项目创建成功:', newProject);

    // Reset form
    setFormData({
      name: '',
      chipModel: 'ssd1677',
    });

    // Navigate to project details page
    if (newProject && newProject.id) {
      console.log('跳转到项目详情页, ID:', newProject.id);
      navigate(`/project-details?id=${newProject.id}`);
    } else {
      console.error('项目创建失败或没有返回ID:', newProject);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importProject(file);
        // TODO: Add success toast
      } catch (error) {
        // TODO: Add error toast
        console.error('Import failed:', error);
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAction = (action: string, projectId: string) => {
    console.log('执行操作:', action, '项目ID:', projectId);
    
    switch (action) {
      case 'open':
        // Navigate to project details page
        console.log('导航到项目详情页:', `/project-details?id=${projectId}`);
        navigate(`/project-details?id=${projectId}`);
        break;
      case 'edit':
        // TODO: Edit project metadata
        console.log('编辑项目:', projectId);
        break;
      case 'delete':
        if (confirm(t('common.confirm'))) {
          console.log('删除项目:', projectId);
          deleteProject(projectId);
        }
        break;
      case 'download':
        console.log('导出项目:', projectId);
        exportProject(projectId);
        break;
      case 'share':
        // TODO: Implement sharing
        console.log('分享项目:', projectId);
        break;
      default:
        console.warn('未知操作:', action);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t('app.welcomeTitle')}
          </h1>
        </div>

        {/* Create Project Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">{t('project.create')}</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Select
                label={t('project.chip')}
                placeholder="选择芯片型号"
                selectedKeys={[formData.chipModel]}
                onSelectionChange={(keys: any) => {
                  const key = Array.from(keys)[0] as string;
                  setFormData(prev => ({ ...prev, chipModel: key as 'ssd1677' }));
                }}
              >
                {driverConfigs.map((config) => (
                  <SelectItem key={config.id}>
                    {config.name}
                  </SelectItem>
                ))}
              </Select>

              <Input
                label={t('project.name')}
                placeholder="输入项目名称"
                value={formData.name}
                onChange={(e: any) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="flex justify-end">
              <Button
                color="primary"
                size="lg"
                onClick={handleCreateProject}
                disabled={!formData.name.trim()}
              >
                {t('project.createButton')}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Project List Section */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('project.list')}</h2>
            <Button
              color="primary"
              variant="bordered"
              onClick={handleImport}
            >
              + {t('project.import')}
            </Button>
          </CardHeader>
          <CardBody>
            <Table aria-label="Projects table">
              <TableHeader>
                <TableColumn>{t('project.name')}</TableColumn>
                <TableColumn>{t('project.chip')}</TableColumn>
                <TableColumn>{t('project.createdTime')}</TableColumn>
                <TableColumn>{t('project.updatedTime')}</TableColumn>
                <TableColumn>{t('project.actions')}</TableColumn>
              </TableHeader>
              <TableBody emptyContent={loading ? t('common.loading') : '暂无项目'}>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{t('driver.ssd1677')}</TableCell>
                    <TableCell>{formatDate(project.createdTime)}</TableCell>
                    <TableCell>{formatDate(project.updatedTime)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip content={t('project.open')}>
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onClick={() => handleAction('open', project.id)}
                          >
                            {t('project.open')}
                          </Button>
                        </Tooltip>
                        
                        <Dropdown>
                          <DropdownTrigger>
                            <Button size="sm" variant="flat">
                              ⋯
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Project actions"
                            onAction={(key: any) => handleAction(key as string, project.id)}
                          >
                            <DropdownItem key="edit">{t('project.edit')}</DropdownItem>
                            <DropdownItem key="download">{t('project.download')}</DropdownItem>
                            <DropdownItem key="share">{t('project.share')}</DropdownItem>
                            <DropdownItem 
                              key="delete" 
                              className="text-danger" 
                              color="danger"
                            >
                              {t('project.delete')}
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileImport}
        />
      </div>
    </DefaultLayout>
  );
}
