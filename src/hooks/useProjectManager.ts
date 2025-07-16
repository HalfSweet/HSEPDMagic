import { useState, useEffect } from 'react';
import { Project } from '@/types';

const PROJECTS_STORAGE_KEY = 'hse-pdm-magic-projects';

export function useProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Load projects from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (stored) {
        setProjects(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
      } catch (error) {
        console.error('Failed to save projects:', error);
      }
    }
  }, [projects, loading]);

  const createProject = (projectData: Omit<Project, 'id' | 'createdTime' | 'updatedTime'>) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: generateId(),
      createdTime: now,
      updatedTime: now,
    };

    setProjects(prev => [newProject, ...prev]);
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
    return projects.find(project => project.id === id);
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
