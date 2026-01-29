import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from '../utils/toast';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import DashboardHome from '../components/Dashboard/DashboardHome';
import { AgentChat } from '../components/Dashboard/AgentChat';
import ActivityLogs from '../components/Dashboard/ActivityLogs';
import ProductDetail from '../components/Product/ProductDetail';
import ProfileSettings from '../components/Dashboard/ProfileSettings';
import BillingPlans from '../components/Dashboard/BillingPlans';
import CartDrawer from '../components/Cart/CartDrawer';
import Assistant from '../components/Assistant/Assistant';
import EmailVerificationBanner from '../components/Auth/EmailVerificationBanner';
import { getProjects, deleteProject as deleteProjectFunction, saveProject as saveProjectFunction } from '../services/firebaseFunctions';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { TOOLS } from '../constants';
import VideoGenerator from '../components/Dashboard/VideoGenerator';
import ImageStudio from '../components/Dashboard/ImageStudio';
import Inspiration from '../components/Dashboard/Inspiration';
import Avatars from '../components/Dashboard/Avatars';
import Analytics from '../components/Dashboard/Analytics';
import Publisher from '../components/Dashboard/Publisher';
import SmartCreation from '../components/Dashboard/SmartCreation';
import Assets from '../components/Dashboard/Assets';

function Home() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Load saved state from localStorage
  const loadSavedViewState = () => {
    try {
      const saved = localStorage.getItem('dashboard_view_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        let restoredView = parsed.view || { type: 'home' };

        // If saved view is workspace with toolId, restore the tool object
        if (restoredView.type === 'workspace' && restoredView.toolId) {
          const tool = TOOLS.find(t => t.id === restoredView.toolId);
          if (tool) {
            restoredView = { type: 'workspace', tool };
          } else {
            // If tool not found, reset to home
            restoredView = { type: 'home' };
          }
        }

        const normalizedTab = parsed.dashboardTab === 'activity' ? 'dashboard' : parsed.dashboardTab;
        return {
          dashboardTab: normalizedTab || 'dashboard',
          view: restoredView,
          scrollPosition: parsed.scrollPosition || 0
        };
      }
    } catch (e) {
      console.error('Error loading saved view state:', e);
    }
    return null;
  };

  const savedState = loadSavedViewState();

  /* eslint-disable no-unused-vars */
  const [dashboardTab, setDashboardTab] = useState(savedState?.dashboardTab || 'dashboard');
  const [view, setView] = useState(savedState?.view || { type: 'home' });

  // Get location for navigation state
  const location = useLocation();
  const [initialPrompt, setInitialPrompt] = useState(location.state?.initialPrompt);
  /** Open existing chat (full history) when coming from Assets */
  const [initialProject, setInitialProject] = useState(null);

  useEffect(() => {
    if (location.state?.initialPrompt) {
      setInitialPrompt(location.state.initialPrompt);
    }
  }, [location.state]);

  const [projects, setProjects] = useState([]);
  const [highlightedProjectId, setHighlightedProjectId] = useState(null);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  /** Mở chat trực tiếp từ Assets (realtime: chuyển ngay, AgentChat tự load project) */
  const [openProjectId, setOpenProjectId] = useState(null);
  /* eslint-enable no-unused-vars */

  // Save view state to localStorage
  useEffect(() => {
    const stateToSave = {
      dashboardTab,
      view: view.type === 'workspace'
        ? { type: 'workspace', toolId: view.tool?.id }
        : view,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem('dashboard_view_state', JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving view state:', e);
    }
  }, [dashboardTab, view]);

  // Save and restore scroll position
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('dashboard_scroll_position', window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Restore scroll position on mount
    const savedScroll = sessionStorage.getItem('dashboard_scroll_position');
    if (savedScroll && savedState) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
      }, 100);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [savedState]);

  // Real-time listener for projects
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setIsLoadingProjects(false);
      return;
    }

    setIsLoadingProjects(true);

    // Firestore path: projects (root collection) where userId matches
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        projectId: doc.id
      }));

      // Transform Firestore response to match GeneratedContent format
      const transformedProjects = projectsData.map(project => {
        // Handle Firestore Timestamp
        const createdAt = project.createdAt?.toMillis ? project.createdAt.toMillis() :
          (project.createdAt?._seconds ? project.createdAt._seconds * 1000 :
            new Date(project.createdAt || Date.now()).getTime());

        return {
          id: project.id || project.projectId,
          toolName: project.type || 'Unknown',
          prompt: project.title || project.metadata?.prompt || '',
          result: project.content?.text || project.content?.imageUrl || project.content?.images?.[0] || '',
          type: (project.content?.imageUrl || project.content?.images?.length > 0 || project.type === 'image') ? 'image' : 'text',
          timestamp: createdAt
        };
      });

      // Sort client-side (Newest first)
      transformedProjects.sort((a, b) => b.timestamp - a.timestamp);

      setProjects(transformedProjects);
      setIsLoadingProjects(false);
    }, (error) => {
      console.error("Error listening to projects:", error);
      setIsLoadingProjects(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle tool query parameter from URL (e.g., ?tool=t1)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const toolId = urlParams.get('tool');

    if (toolId) {
      const tool = TOOLS.find(t => t.id === toolId);
      if (tool) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setView({ type: 'workspace', tool });
        setDashboardTab('tools');
        // Clear the query parameter from URL
        window.history.replaceState({}, '', '/dashboard');
      } else {
        // If tool not found, reset to home view
        console.warn(`Tool with ID ${toolId} not found`);
        setView({ type: 'home' });
        window.history.replaceState({}, '', '/dashboard');
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const saveProject = async (content) => {
    try {
      const normalizeResultContent = (value) => {
        if (typeof value === 'string') return value.trim();
        if (Array.isArray(value)) {
          const first = value.find((item) => typeof item === 'string' && item.trim().length > 0);
          return typeof first === 'string' ? first.trim() : '';
        }
        if (value && typeof value === 'object') {
          const candidate = value;
          if (typeof candidate.url === 'string') return candidate.url.trim();
          if (typeof candidate.imageUrl === 'string') return candidate.imageUrl.trim();
          if (typeof candidate.dataUrl === 'string') return candidate.dataUrl.trim();
        }
        return '';
      };

      const resultContent = normalizeResultContent(content?.result);
      if (content?.type === 'image') {
        if (!resultContent) {
          throw new Error('Image content is empty.');
        }
      } else if (!resultContent) {
        throw new Error('Text content is empty.');
      }

      const projectType = content.type === 'image' ? 'image' :
        (content.toolName?.toLowerCase().includes('blog') ? 'blog' :
          content.toolName?.toLowerCase().includes('caption') ? 'caption' :
            content.toolName?.toLowerCase().includes('email') ? 'email' :
              content.toolName?.toLowerCase().includes('product') ? 'product' : 'blog');

      // Map content to Firestore project format
      const projectData = {
        title: content.prompt || content.toolName || 'Untitled Project',
        type: projectType,
        content: projectType === 'image'
          ? { imageUrl: resultContent, images: [resultContent] }
          : { text: resultContent },
        metadata: {
          prompt: content.prompt || ''
        }
      };

      // Save to Firestore via Firebase Function
      await saveProjectFunction(projectData);

      setIsProjectDrawerOpen(true);
      return true;
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  };

  const removeProject = async (id) => {
    // 1. Confirmation
    const confirmMessage = language === 'vi'
      ? 'Bạn có chắc chắn muốn xóa dự án này không?'
      : 'Are you sure you want to delete this project?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    // 2. Optimistic Update (Delete immediately from UI)
    const previousProjects = [...projects];
    setProjects(prev => prev.filter(p => p.id !== id));

    try {
      // 3. Call Firebase Function to delete project
      await deleteProjectFunction(id);
      // Success - show toast
      const successMessage = language === 'vi' ? 'Đã xóa dự án thành công' : 'Project deleted successfully';
      toast.success(successMessage);
    } catch (error) {
      console.error('Failed to delete project:', error);
      // 4. Revert if failed
      setProjects(previousProjects);
      // Show error toast
      const errorMessage = language === 'vi' ? 'Xóa thất bại. Vui lòng thử lại.' : 'Failed to delete. Please try again.';
      toast.error(errorMessage);
    }
  };

  const openProjectFromActivity = (project) => {
    if (!project?.id) return;
    setHighlightedProjectId(project.id);
    setDashboardTab('projects');
    setView({ type: 'home' });
  };

  const clearHighlight = () => {
    setHighlightedProjectId(null);
  };

  const handleTryToolFromInspiration = (tool, initialPrompt, initialStyle) => {
    if (!tool?.id) return;
    const storageKey = `tool_${tool.id}_draft`;
    const stateToSave = {
      prompt: initialPrompt || '',
      style: initialStyle || 'Professional',
      result: { type: tool.inputType === 'image_prompt' ? 'image' : 'text', content: '' },
      history: [initialPrompt || ''],
      historyIndex: 0,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to store inspiration preset:', error);
    }

    setView({ type: 'workspace', tool });
    setDashboardTab('tools');
  };

  return (
    <DashboardLayout
      activeTab={dashboardTab}
      onTabChange={(tab) => {
        setDashboardTab(tab);
        if (view.type === 'workspace' && (tab === 'dashboard' || tab === 'tools' || tab === 'projects' || tab === 'inspiration')) {
          setView({ type: 'home' });
          setIsChatActive(false);
        }
        if (tab === 'settings' || tab === 'billing') {
          setView({ type: 'home' });
          setIsChatActive(false);
        }
      }}
      onLogout={handleLogout}
      userEmail={user?.email || 'creator@demo.com'}
      isSidebarCollapsed={isSidebarCollapsed}
      onSidebarToggle={setIsSidebarCollapsed}
      hideHeader={isChatActive}
    >
      {/* If user is in workspace mode (tool selected), show workspace */}
      {
        view.type === 'workspace' && view.tool && dashboardTab !== 'settings' && dashboardTab !== 'billing' && (
          <ProductDetail
            tool={view.tool}
            onBack={() => {
              setView({ type: 'home' });
              setIsChatActive(false);
            }}
            onSave={saveProject}
          />
        )
      }

      {/* If user is NOT in workspace, show dashboard tabs */}
      {
        (view.type === 'home' || view.type === 'activity') && (
          <>
            {dashboardTab === 'dashboard' && view.type === 'home' && isChatActive && openProjectId ? (
              <AgentChat
                projectId={openProjectId}
                onBack={() => {
                  setOpenProjectId(null);
                  setIsChatActive(false);
                  setIsSidebarCollapsed(false);
                }}
              />
            ) : dashboardTab === 'dashboard' && view.type === 'home' && (
              <DashboardHome
                onCollapseSidebar={setIsSidebarCollapsed}
                initialPrompt={initialPrompt}
                initialProject={initialProject}
                onChatToggle={(active) => {
                  setIsChatActive(active);
                  if (!active) {
                    setInitialProject(null);
                    setOpenProjectId(null);
                  }
                  if (active && initialPrompt && !initialProject) setTimeout(() => setInitialPrompt(null), 100);
                  if (active && initialProject) setTimeout(() => setInitialProject(null), 150);
                }}
              />
            )}

            {dashboardTab === 'dashboard' && view.type === 'activity' && (
              <ActivityLogs onBack={() => setView({ type: 'home' })} />
            )}

            {/* New Sidebar Pages */}
            {dashboardTab === 'video-generator' && <VideoGenerator />}
            {dashboardTab === 'image-studio' && <ImageStudio />}
            {dashboardTab === 'inspiration' && <Inspiration />}
            {dashboardTab === 'avatars' && <Avatars />}
            {dashboardTab === 'analytics' && <Analytics />}
            {dashboardTab === 'publisher' && <Publisher />}
            {dashboardTab === 'smart-creation' && <SmartCreation />}
            {dashboardTab === 'assets' && (
              <Assets
                onNavigateToProject={(project) => {
                  setOpenProjectId(project.id);
                  setDashboardTab('dashboard');
                  setView({ type: 'home' });
                  setIsChatActive(true);
                  setIsSidebarCollapsed(true);
                }}
              />
            )}

            {dashboardTab === 'settings' && <ProfileSettings />}
            {dashboardTab === 'billing' && (
              <BillingPlans
                onBack={() => {
                  setDashboardTab('dashboard');
                  setView({ type: 'home' });
                }}
              />
            )}
          </>
        )
      }

      <CartDrawer
        isOpen={isProjectDrawerOpen}
        onClose={() => setIsProjectDrawerOpen(false)}
        items={projects}
        onRemoveItem={removeProject}
      />
      <Assistant />
    </DashboardLayout>
  );
}

export default Home;