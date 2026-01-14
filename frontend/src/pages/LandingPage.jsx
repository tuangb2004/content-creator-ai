import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

function LandingPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState('signup'); // 'signin' or 'signup'
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState({ type: 'home' });
  const [projects, setProjects] = useState([]);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [pendingTool, setPendingTool] = useState(null); // Track tool user wanted to use before login

  // Clear logout flag when landing page loads
  useEffect(() => {
    localStorage.removeItem('logging_out');
  }, []);

  // Auto-open auth modal if coming from /register or /login route
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
      setView({ type: 'terms' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (targetId === 'privacy') {
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
              setTimeout(() => {
                const element = document.getElementById('products');
                if (element) {
                  const headerOffset = 85;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.scrollY - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
              }, 50);
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
              setTimeout(() => {
                const element = document.getElementById('products');
                if (element) {
                  const headerOffset = 85;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.scrollY - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
              }, 50);
            }}
            onSave={(content) => {
              if (!user) {
                setAuthType('signup');
                setShowAuthModal(true);
                return;
              }
              saveProject(content);
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
        onClose={() => setShowAuthModal(false)} 
        onLogin={handleLogin}
        onNavigate={handleLegalNav}
        type={authType}
        onSwitchType={(newType) => setAuthType(newType)}
      />
    </div>
  );
}

export default LandingPage;