import { useEffect, useState, useCallback } from 'react';
import { getProjects, deleteProject as deleteProjectFunction } from '../services/firebaseFunctions';
import toast from '../utils/toast';
import { useLanguage } from '../contexts/LanguageContext';
import { Trash2, Search, Filter } from 'lucide-react';
import PageHeader from '../components/Shared/PageHeader';
import EmptyState from '../components/Projects/EmptyState';

function ProjectsPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      const result = await getProjects();
      // Convert Firestore timestamp to Date and map id field
      const formattedProjects = result.projects.map(project => ({
        ...project,
        _id: project.id, // Use id as _id for compatibility
        createdAt: project.createdAt?.toDate ? project.createdAt.toDate() : new Date(project.createdAt?.seconds * 1000 || Date.now()),
        updatedAt: project.updatedAt?.toDate ? project.updatedAt.toDate() : new Date(project.updatedAt?.seconds * 1000 || Date.now())
      }));
      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error(error.message || t('messages.error.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const deleteProject = async (id) => {
    if (!confirm(t('projects.deleteConfirm'))) return;

    try {
      await deleteProjectFunction(id);
      setProjects(projects.filter(p => p._id !== id && p.id !== id));
      toast.success(t('messages.success.deleted'));
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(error.message || t('messages.error.generic'));
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.type === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const typeIcons = {
    blog: '📝',
    caption: '📱',
    email: '✉️',
    product: '🛍️',
    image: '🎨'
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <main className="flex-1 overflow-y-auto">
        <PageHeader title={t('projects.title')} />
        <div className="px-10 py-8">
          <p className="text-gray-600 mb-6">
            {projects.length} {projects.length === 1 ? t('projects.project') : t('projects.projects')} {t('projects.total')}
          </p>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('projects.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('projects.allTypes')}</option>
                  <option value="blog">{t('projects.blogPosts')}</option>
                  <option value="caption">{t('projects.captions')}</option>
                  <option value="email">{t('projects.emails')}</option>
                  <option value="product">{t('projects.products')}</option>
                  <option value="image">{t('projects.images')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <EmptyState hasFilters={searchQuery || filter !== 'all'} />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onDelete={deleteProject}
                  typeIcons={typeIcons}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProjectCard({ project, onDelete, typeIcons, t }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">{typeIcons[project.type]}</span>
            <span className="text-xs font-semibold text-gray-500 uppercase px-2 py-1 bg-gray-100 rounded">
              {project.type}
            </span>
          </div>
          <button
            onClick={() => onDelete(project._id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title={t('common.delete')}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
        <p className="text-xs text-gray-500">
          {new Date(project.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Content Preview */}
      <div className="p-6">
        {project.type === 'image' ? (
          <div className="relative">
            <img
              src={project.content.images[0]}
              alt={project.title}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400?text=Image';
              }}
            />
          </div>
        ) : (
          <>
            <p className={`text-sm text-gray-600 ${!expanded ? 'line-clamp-3' : ''}`}>
              {project.content.text}
            </p>
            {project.content.text && project.content.text.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold mt-2"
              >
                {expanded ? t('projects.viewLess') : t('projects.viewMore')} →
              </button>
            )}
          </>
        )}
      </div>

      {/* Metadata */}
      {project.metadata && (
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2">
            {project.metadata.tone && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                {project.metadata.tone}
              </span>
            )}
            {project.metadata.length && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                {project.metadata.length}
              </span>
            )}
            {project.metadata.style && (
              <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded">
                {project.metadata.style}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;