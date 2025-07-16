import { useState, useEffect } from 'react';
import { Project } from '@/types';

const PROJECTS_STORAGE_KEY = 'hse-pdm-magic-projects';

export function useProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Load projects from localStorage on mount
  useEffect(() => {
    console.log('加载项目从 localStorage...');
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      console.log('localStorage 数据:', stored);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('解析的项目数据:', parsed);
        setProjects(parsed);
      } else {
        console.log('localStorage 中没有项目数据');
      }
    } catch (error) {
      console.error('加载项目失败:', error);
    } finally {
      setLoading(false);
      console.log('项目加载完成');
    }
  }, []);

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (!loading) {
      console.log('保存项目到 localStorage, 项目数量:', projects.length);
      try {
        const dataToSave = JSON.stringify(projects);
        localStorage.setItem(PROJECTS_STORAGE_KEY, dataToSave);
        console.log('项目保存成功');
      } catch (error) {
        console.error('保存项目失败:', error);
      }
    }
  }, [projects, loading]);

  const createProject = (projectData: Omit<Project, 'id' | 'createdTime' | 'updatedTime'>) => {
    console.log('useProjectManager.createProject 被调用:', projectData);
    
    const now = new Date().toISOString();
    const newId = generateId();
    console.log('生成的项目ID:', newId);
    
    const newProject: Project = {
      ...projectData,
      id: newId,
      createdTime: now,
      updatedTime: now,
    };

    console.log('新项目对象:', newProject);
    
    // 立即更新项目列表
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    
    // 立即保存到localStorage
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
      console.log('新项目立即保存到localStorage成功');
    } catch (error) {
      console.error('保存新项目失败:', error);
    }
    
    console.log('更新后的项目列表长度:', updatedProjects.length);
    console.log('createProject 完成，返回项目:', newProject);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id
          ? { ...project, ...updates, updatedTime: new Date().toISOString() }
          : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const getProject = (id: string) => {
    console.log('useProjectManager.getProject 被调用, ID:', id);
    console.log('当前项目列表:', projects.map(p => ({ id: p.id, name: p.name })));
    
    const found = projects.find(project => project.id === id);
    console.log('查找结果:', found ? `找到: ${found.name}` : '未找到');
    
    return found;
  };

  const duplicateProject = (id: string) => {
    const project = getProject(id);
    if (project) {
      const now = new Date().toISOString();
      const newProject: Project = {
        ...project,
        id: generateId(),
        name: `${project.name} (副本)`,
        createdTime: now,
        updatedTime: now,
      };
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    }
  };

  const exportProject = (id: string) => {
    const project = getProject(id);
    if (project) {
      const dataStr = JSON.stringify(project, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const importProject = (file: File) => {
    return new Promise<Project>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const projectData = JSON.parse(content) as Project;
          
          // Generate new ID and timestamps for imported project
          const now = new Date().toISOString();
          const newProject: Project = {
            ...projectData,
            id: generateId(),
            name: `${projectData.name} (导入)`,
            createdTime: now,
            updatedTime: now,
          };
          
          setProjects(prev => [newProject, ...prev]);
          resolve(newProject);
        } catch (error) {
          reject(new Error('Invalid project file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    duplicateProject,
    exportProject,
    importProject,
  };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
