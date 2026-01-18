import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import DashboardHome from '../components/Dashboard/DashboardHome';
import ActivityLogs from '../components/Dashboard/ActivityLogs';
import ProductDetail from '../components/Product/ProductDetail';
import ProjectList from '../components/Dashboard/ProjectList';
import ProfileSettings from '../components/Dashboard/ProfileSettings';
import BillingPlans from '../components/Dashboard/BillingPlans';
import InspirationGallery from '../components/Dashboard/InspirationGallery';
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

  const [dashboardTab, setDashboardTab] = useState(savedState?.dashboardTab || 'dashboard');
  const [view, setView] = useState(savedState?.view || { type: 'home' });
  const [projects, setProjects] = useState([]);
  const [highlightedProjectId, setHighlightedProjectId] = useState(null);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch = !searchQuery.trim() ||
      (tool.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.name_vi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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

  // Load projects from Firestore via Firebase Functions
  const loadProjects = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadProjects();
    }
  }, [user, loadProjects]);

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

      // Reload projects to get the saved project with proper ID
      await loadProjects();

      setIsProjectDrawerOpen(true);
      return true;
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
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
      setProjects(prev => prev.filter(p => p.id !== id));
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
        }
        if (tab === 'settings' || tab === 'billing') {
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
      {(view.type === 'home' || view.type === 'activity') && (
        <>
          {dashboardTab === 'dashboard' && view.type === 'home' && (
            <DashboardHome
              onToolSelect={(t) => setView({ type: 'workspace', tool: t })}
              recentProjects={projects.slice(0, 5)}
              onViewAll={() => setDashboardTab('tools')}
              onViewAuditLog={() => setView({ type: 'activity' })}
              onViewProjects={() => setDashboardTab('projects')}
              onOpenProject={openProjectFromActivity}
            />
          )}
          {dashboardTab === 'dashboard' && view.type === 'activity' && (
            <ActivityLogs onBack={() => setView({ type: 'home' })} />
          )}
          {(dashboardTab === 'tools' || dashboardTab === 'inspiration') && (
            <div className="py-12 animate-fade-in-up">
              {dashboardTab === 'tools' ? (
                <>
                  {/* Command Center Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
                    <div>
                      <h2 className={`text-4xl font-serif mb-2 transition-colors duration-300 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                        }`}>Command Center</h2>
                      <p className={`transition-colors duration-300 ${theme === 'dark' ? 'text-[#5D5A53]' : 'text-[#A8A29E]'
                        }`}>Access the full depth of CreatorAI tools.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                      <input
                        type="text"
                        placeholder="Search tools, capabilities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full border pl-10 pr-4 py-3 text-sm outline-none rounded-sm transition-all ${theme === 'dark'
                          ? 'bg-[#1C1B19] border-[#433E38] text-[#F5F2EB] placeholder-[#5D5A53] focus:border-[#F5F2EB]'
                          : 'bg-white border-[#D6D1C7] text-[#2C2A26] placeholder-[#A8A29E] focus:border-[#2C2A26]'
                          }`}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                  </div>

                  {/* Category Filters */}
                  <div className={`flex flex-wrap gap-4 mb-12 pb-4 border-b transition-colors duration-300 ${theme === 'dark' ? 'border-[#433E38]' : 'border-[#D6D1C7]'
                    }`}>
                    {['All', 'Text', 'Image', 'Social', 'Strategy'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-full border ${activeCategory === cat
                          ? theme === 'dark'
                            ? 'bg-[#F5F2EB] text-[#2C2A26] border-[#F5F2EB] shadow-md'
                            : 'bg-[#2C2A26] text-white border-[#2C2A26] shadow-md'
                          : theme === 'dark'
                            ? 'bg-[#2C2A26] text-[#A8A29E] border-[#433E38] hover:border-[#F5F2EB]'
                            : 'bg-white text-[#A8A29E] border-[#D6D1C7] hover:border-[#2C2A26]'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Tools Grid or Empty State */}
                  {filteredTools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredTools.map(tool => (
                        <div
                          key={tool.id}
                          onClick={() => setView({ type: 'workspace', tool })}
                          className={`group border transition-all cursor-pointer flex flex-col h-full rounded-sm shadow-sm hover:shadow-xl overflow-hidden ${theme === 'dark'
                            ? 'bg-[#2C2A26] border-[#433E38] hover:border-[#F5F2EB]'
                            : 'bg-white border-[#D6D1C7] hover:border-[#2C2A26]'
                            }`}
                        >
                          {/* Tool Image with Category Badge */}
                          <div className={`relative h-48 overflow-hidden ${theme === 'dark' ? 'bg-[#1C1B19]' : 'bg-[#F5F2EB]'
                            }`}>
                            <img
                              src={tool.imageUrl}
                              alt=""
                              className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                            />
                            <div className="absolute top-4 left-4">
                              <span className={`backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm ${theme === 'dark' ? 'bg-black/80' : 'bg-white/90'
                                }`}>
                                {tool.category}
                              </span>
                            </div>
                          </div>

                          {/* Tool Content */}
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className={`text-xl font-serif transition-colors duration-300 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                                }`}>{tool.name}</h4>
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${theme === 'dark'
                                ? 'border-[#433E38] group-hover:bg-[#F5F2EB] group-hover:text-[#2C2A26]'
                                : 'border-[#D6D1C7] group-hover:bg-[#2C2A26] group-hover:text-white'
                                }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                              </div>
                            </div>

                            <p className={`text-sm font-light leading-relaxed mb-6 flex-1 transition-colors duration-300 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                              }`}>{tool.description}</p>

                            {/* Key Features */}
                            <div className={`flex flex-wrap gap-2 pt-6 border-t transition-colors duration-300 ${theme === 'dark' ? 'border-[#433E38]' : 'border-[#F5F2EB]'
                              }`}>
                              {tool.features.slice(0, 3).map((feat, i) => (
                                <span key={i} className="text-[9px] font-bold uppercase tracking-tighter text-[#A8A29E]">#{feat}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Beautiful Empty State */
                    <div className="py-32 flex flex-col items-center justify-center text-center animate-fade-in-up">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 text-[#A8A29E] ${theme === 'dark' ? 'bg-[#2C2A26]' : 'bg-[#F5F2EB]'
                        }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                      </div>
                      <h3 className={`text-2xl font-serif mb-2 transition-colors duration-300 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                        }`}>No matching tools found</h3>
                      <p className="text-[#A8A29E] max-w-xs font-light">Try adjusting your keywords or clearing the category filter.</p>
                      <button
                        onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                        className={`mt-8 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-current pb-1 hover:opacity-60 transition-opacity ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                          }`}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <InspirationGallery onTryTool={handleTryToolFromInspiration} />
              )}
            </div>
          )}
          {dashboardTab === 'projects' && (
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className={`text-4xl font-serif mb-2 transition-colors duration-300 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                    }`}>Your Projects</h2>
                  <p className={`transition-colors duration-300 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'
                    }`}>Manage and organize your generated content.</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#2C2A26] border border-[#D6D1C7] px-3 py-1 rounded-full">
                  {projects.length} Items
                </span>
              </div>

              <ProjectList
                items={projects}
                onRemoveItem={removeProject}
                highlightedProjectId={highlightedProjectId}
                onClearHighlight={clearHighlight}
              />
            </div>
          )}
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