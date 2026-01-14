import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import DashboardHome from '../components/Dashboard/DashboardHome';
import ProductGrid from '../components/Product/ProductGrid';
import ProductDetail from '../components/Product/ProductDetail';
import ProjectList from '../components/Dashboard/ProjectList';
import ProfileSettings from '../components/Dashboard/ProfileSettings';
import BillingPlans from '../components/Dashboard/BillingPlans';
import ActivityLogs from '../components/Dashboard/ActivityLogs';
import CartDrawer from '../components/Cart/CartDrawer';
import Assistant from '../components/Assistant/Assistant';
import EmailVerificationBanner from '../components/Auth/EmailVerificationBanner';
import { getProjects, deleteProject as deleteProjectFunction, saveProject as saveProjectFunction } from '../services/firebaseFunctions';
import { TOOLS } from '../constants';

function Home() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
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
        
        return {
          dashboardTab: parsed.dashboardTab || 'dashboard',
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
  
  const [dashboardTab, setDashboardTab] = useState(savedState?.dashboardTab || 'dashboard');
  const [view, setView] = useState(savedState?.view || { type: 'home' });
  const [projects, setProjects] = useState([]);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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
  }, []);

  // Load projects from Firestore via Firebase Functions
  const loadProjects = async () => {
    try {
      const result = await getProjects();
      const projectsData = result.projects || [];
      
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
      setProjects(transformedProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      // Set empty array on error to prevent crashes
      setProjects([]);
    }
  };

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  // Handle tool query parameter from URL (e.g., ?tool=t1)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const toolId = urlParams.get('tool');
    
    if (toolId) {
      const tool = TOOLS.find(t => t.id === toolId);
      if (tool) {
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
      // Map content to Firestore project format
      const projectData = {
        title: content.prompt || content.toolName || 'Untitled Project',
        type: content.type === 'image' ? 'image' : 
              (content.toolName?.toLowerCase().includes('blog') ? 'blog' :
              content.toolName?.toLowerCase().includes('caption') ? 'caption' :
              content.toolName?.toLowerCase().includes('email') ? 'email' :
              content.toolName?.toLowerCase().includes('product') ? 'product' : 'blog'),
        content: content.type === 'image' 
          ? { imageUrl: content.result, images: [content.result] }
          : { text: content.result },
        metadata: {
          prompt: content.prompt || ''
        }
      };

      // Save to Firestore via Firebase Function
      await saveProjectFunction(projectData);
      
      // Reload projects to get the saved project with proper ID
      await loadProjects();
      
      setIsProjectDrawerOpen(true);
    } catch (error) {
      console.error('Failed to save project:', error);
      // Still add to local state for immediate feedback
      setProjects([content, ...projects]);
      setIsProjectDrawerOpen(true);
    }
  };

  const removeProject = async (id) => {
    try {
      // Call Firebase Function to delete project
      await deleteProjectFunction(id);
      // Reload projects from Firestore to ensure data is real-time and consistent
      await loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      // If delete fails, still remove from local state for items that were only in memory
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleCartClick = () => {
    setIsProjectDrawerOpen(true);
  };

  return (
    <DashboardLayout 
      activeTab={dashboardTab} 
      onTabChange={(tab) => {
        setDashboardTab(tab);
        if (view.type === 'workspace' && (tab === 'dashboard' || tab === 'tools' || tab === 'projects' || tab === 'activity')) {
          setView({ type: 'home' });
        }
        if (tab === 'settings' || tab === 'billing' || tab === 'activity') {
          setView({ type: 'home' });
        }
      }}
      onLogout={handleLogout}
      userEmail={user?.email || 'creator@demo.com'}
    >
      {/* If user is in workspace mode (tool selected), show workspace */}
      {view.type === 'workspace' && view.tool && dashboardTab !== 'settings' && dashboardTab !== 'billing' && (
        <ProductDetail 
          tool={view.tool} 
          onBack={() => setView({ type: 'home' })}
          onSave={saveProject}
        />
      )}

      {/* If user is NOT in workspace, show dashboard tabs */}
      {view.type === 'home' && (
        <>
          {dashboardTab === 'dashboard' && (
            <DashboardHome 
              onToolSelect={(t) => setView({ type: 'workspace', tool: t })} 
              recentProjects={projects.slice(0, 5)} 
            />
          )}
          {(dashboardTab === 'tools' || dashboardTab === 'inspiration') && (
            <div>
              <h2 className={`text-4xl font-serif mb-8 transition-colors duration-300 ${
                theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
              }`}>All Tools</h2>
              <ProductGrid 
                onProductClick={(t) => setView({ type: 'workspace', tool: t })} 
                searchQuery={searchQuery}
                compact={true}
              />
            </div>
          )}
          {dashboardTab === 'projects' && (
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className={`text-4xl font-serif mb-2 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                  }`}>Your Projects</h2>
                  <p className={`transition-colors duration-300 ${
                    theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'
                  }`}>Manage and organize your generated content.</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#2C2A26] border border-[#D6D1C7] px-3 py-1 rounded-full">
                  {projects.length} Items
                </span>
              </div>
              
              <ProjectList items={projects} onRemoveItem={removeProject} />
            </div>
          )}
          {dashboardTab === 'activity' && <ActivityLogs />}
          {dashboardTab === 'settings' && <ProfileSettings />}
          {dashboardTab === 'billing' && <BillingPlans />}
        </>
      )}

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