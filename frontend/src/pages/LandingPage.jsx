import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthModal from '../components/Auth/AuthModal';
import LandingNavbar from '../components/Landing/LandingNavbar';
import Hero from '../components/Landing/Hero';
import ProductGrid from '../components/Product/ProductGrid';
import ProductDetail from '../components/Product/ProductDetail';
import ToolPreview from '../components/Product/ToolPreview';
import About from '../components/Landing/About';
import Journal from '../components/Journal/Journal';
import JournalDetail from '../components/Journal/JournalDetail';
import CartDrawer from '../components/Cart/CartDrawer';
import Assistant from '../components/Assistant/Assistant';
import Footer from '../components/Landing/Footer';
import TermsOfService from '../components/Legal/TermsOfService';
import PrivacyPolicy from '../components/Legal/PrivacyPolicy';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from '../utils/toast';

function LandingPage() {
  const { user, loading, signInWithCustomTokenAuth } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState('signup'); // 'signin' or 'signup'
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState({ type: 'home' });
  const [projects, setProjects] = useState([]);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [pendingTool, setPendingTool] = useState(null); // Track tool user wanted to use before login
  const homeScrollRef = useRef(0);
  const shouldRestoreScrollRef = useRef(false);

  // Redirect logged-in users to dashboard (unless they just logged out)
  useEffect(() => {
    if (!loading && user && !localStorage.getItem('logging_out')) {
      // User is logged in and not logging out - redirect to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Clear logout flag when landing page loads
  useEffect(() => {
    localStorage.removeItem('logging_out');
  }, []);

  // Auto-open auth modal if user is waiting for verification
  // Check immediately on mount and whenever user changes (including sign out)
  useEffect(() => {
    const checkVerificationModal = () => {
      const showVerificationModal = localStorage.getItem('showVerificationModal');
      const pendingEmail = localStorage.getItem('pendingVerificationEmail');
      
      if (showVerificationModal === 'true' && pendingEmail && !user && !loading) {
        // User is waiting for verification - open modal
        console.log('[LandingPage] Auto-opening verification modal');
        setAuthType('signup');
        setShowAuthModal(true);
      }
    };
    
    // Check immediately
    checkVerificationModal();
    
    // Also check when user or loading changes (including when user signs out)
  }, [user, loading]);
  
  // Keep modal open if verification is pending, even if user signs out
  useEffect(() => {
    const showVerificationModal = localStorage.getItem('showVerificationModal');
    if (showVerificationModal === 'true' && !showAuthModal) {
      // Modal should be open but isn't - open it immediately
      console.log('[LandingPage] Keeping verification modal open');
      setAuthType('signup');
      setShowAuthModal(true);
    }
  }, [showAuthModal]);

  // Handle TikTok OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tiktokToken = urlParams.get('tiktok_token');
    
    if (tiktokToken && !user && !loading) {
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Sign in with custom token
      signInWithCustomTokenAuth(tiktokToken)
        .then(() => {
          toast.success('Đăng nhập TikTok thành công!');
          navigate('/dashboard', { replace: true });
        })
        .catch((error) => {
          console.error('TikTok sign-in error:', error);
          toast.error(error.message || 'Đăng nhập TikTok thất bại');
        });
    }
  }, [user, loading, signInWithCustomTokenAuth, navigate]);

  // Auto-open auth modal if coming from /register or /login route
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const path = location.pathname;
    if (path === '/register') {
      setAuthType('signup');
      setShowAuthModal(true);
      // Clean URL without reloading
      window.history.replaceState({}, '', '/');
    } else if (path === '/login') {
      setAuthType('signin');
      setShowAuthModal(true);
      // Clean URL without reloading
      window.history.replaceState({}, '', '/');
    }
  }, [location.pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openAuthModal = (type) => {
    setAuthType(type === 'login' ? 'signin' : 'signup');
    setShowAuthModal(true);
  };

  const handleLogin = () => {
    // Only close modal and redirect if user is actually logged in
    // Don't close if user just signed up and needs to verify email
    if (user) {
      setShowAuthModal(false);
      // If user was trying to access a tool, send them there
      if (pendingTool) {
        setView({ type: 'workspace', tool: pendingTool });
        setPendingTool(null);
      } else {
        // User is now logged in, redirect to dashboard
        window.location.href = '/dashboard';
      }
    }
    // If user is not logged in (e.g., just signed up), keep modal open
  };

  const handleToolClick = (tool) => {
    if (view.type === 'home') {
      homeScrollRef.current = window.scrollY || 0;
      shouldRestoreScrollRef.current = true;
      // Pre-set flag that we'll need to restore later
      sessionStorage.setItem('will_restore_scroll', 'true');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (user) {
      // If logged in, go straight to workspace
      setView({ type: 'workspace', tool });
    } else {
      // If not logged in, go to Preview
      setView({ type: 'tool_preview', tool });
    }
  };

  const handleUseToolFromPreview = (tool) => {
    if (user) {
      setView({ type: 'workspace', tool });
    } else {
      setPendingTool(tool);
      setAuthType('signup');
      setShowAuthModal(true);
    }
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    
    // Check for special pages
    if (targetId === 'terms') {
      if (view.type === 'home') {
        homeScrollRef.current = window.scrollY || 0;
        shouldRestoreScrollRef.current = true;
      }
      setView({ type: 'terms' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (targetId === 'privacy') {
      if (view.type === 'home') {
        homeScrollRef.current = window.scrollY || 0;
        shouldRestoreScrollRef.current = true;
      }
      setView({ type: 'privacy' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view.type !== 'home') {
      setView({ type: 'home' });
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          const headerOffset = 85;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 50);
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 85;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }
  };

  const handleLegalNav = (page) => {
    setShowAuthModal(false);
    if (view.type === 'home') {
      homeScrollRef.current = window.scrollY || 0;
      shouldRestoreScrollRef.current = true;
    }
    setView({ type: page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCartClick = () => {
    if (user) {
      window.location.href = '/projects';
    } else {
      setIsProjectDrawerOpen(true);
    }
  };

  const saveProject = (content) => {
    setProjects([content, ...projects]);
    setIsProjectDrawerOpen(true);
  };

  const removeProject = (index) => {
    const newItems = [...projects];
    newItems.splice(index, 1);
    setProjects(newItems);
  };

  useLayoutEffect(() => {
    if (view.type === 'home' && shouldRestoreScrollRef.current) {
      const savedScroll = homeScrollRef.current || 0;
      const root = document.documentElement;
      const prevRootBehavior = root.style.scrollBehavior;

      // IMMEDIATELY set flags BEFORE any rendering
      sessionStorage.setItem('is_back_navigation', 'true');
      sessionStorage.setItem('restoring_scroll', 'true');
      document.body.classList.add('restoring-scroll');

      // Disable smooth scroll for instant restoration
      root.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      
      // Immediate scroll without waiting
      root.scrollTop = savedScroll;
      window.scrollTo(0, savedScroll);
      
      // Use requestAnimationFrame for cleanup
      requestAnimationFrame(() => {
        // Keep flags for a bit longer to ensure all components see them
        setTimeout(() => {
          root.style.scrollBehavior = prevRootBehavior;
          document.body.style.scrollBehavior = prevRootBehavior;
          document.body.classList.remove('restoring-scroll');
          sessionStorage.removeItem('restoring_scroll');
          sessionStorage.removeItem('will_restore_scroll');
          // Keep is_back_navigation for 1 second for any delayed renders
          setTimeout(() => {
            sessionStorage.removeItem('is_back_navigation');
          }, 1000);
        }, 200);
      });

      shouldRestoreScrollRef.current = false;
    }
  }, [view.type]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-[#F5F2EB] text-[#2C2A26]'
    }`}>
      {/* Navbar */}
      <LandingNavbar 
        onNavClick={handleNavClick} 
        projectCount={projects.length}
        onCartClick={handleCartClick}
        onAuthClick={(type) => {
          setAuthType(type);
          setShowAuthModal(true);
        }}
        onSearch={setSearchQuery}
      />

      <main>
        {view.type === 'home' && (
          <>
            {/* Hero Section */}
            <Hero onGetStarted={() => openAuthModal('register')} />

            {/* Product Grid */}
            <ProductGrid 
              onProductClick={handleToolClick} 
              searchQuery={searchQuery}
            />

            {/* About Section */}
            <About />

            {/* Journal Section */}
            <Journal 
              onArticleClick={(article) => {
              homeScrollRef.current = window.scrollY || 0;
              shouldRestoreScrollRef.current = true;
                setView({ type: 'journal', article });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              searchQuery={searchQuery}
            />
          </>
        )}

        {/* Public Tool Preview */}
        {view.type === 'tool_preview' && (
          <ToolPreview 
            tool={view.tool}
            onBack={() => {
              setView({ type: 'home' });
            }}
            onUseTool={() => handleUseToolFromPreview(view.tool)}
          />
        )}

        {/* Workspace (for logged in users or as fallback) */}
        {view.type === 'workspace' && (
          <ProductDetail 
            tool={view.tool} 
            onBack={() => {
              setView({ type: 'home' });
            }}
            onSave={async (content) => {
              if (!user) {
                setAuthType('signup');
                setShowAuthModal(true);
                return;
              }
              await saveProject(content);
            }}
          />
        )}

        {view.type === 'journal' && (
          <JournalDetail 
            article={view.article} 
            onBack={() => setView({ type: 'home' })}
          />
        )}

        {view.type === 'terms' && (
          <TermsOfService onBack={() => setView({ type: 'home' })} />
        )}

        {view.type === 'privacy' && (
          <PrivacyPolicy onBack={() => setView({ type: 'home' })} />
        )}
      </main>

      {/* Footer */}
      <Footer onLinkClick={handleNavClick} />

      {/* Assistant */}
      <Assistant />
      
      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isProjectDrawerOpen}
        onClose={() => setIsProjectDrawerOpen(false)}
        items={projects}
        onRemoveItem={removeProject}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          // Don't close modal if user is waiting for verification
          const showVerificationModal = localStorage.getItem('showVerificationModal');
          if (showVerificationModal !== 'true') {
            setShowAuthModal(false);
          }
        }} 
        onLogin={handleLogin}
        onNavigate={handleLegalNav}
        type={authType}
        onSwitchType={(newType) => setAuthType(newType)}
      />
    </div>
  );
}

export default LandingPage;