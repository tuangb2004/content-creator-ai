import { useState } from 'react';
import toast from '../../utils/toast';
import { TOOLS } from '../../constants';

const InspirationGallery = ({ onTryTool }) => {
  const [activeTab, setActiveTab] = useState('trends');

  const googleTrends = [
    { keyword: 'AI Ethics in 2025', growth: '+850%', category: 'Technology', insight: 'People are searching for transparency in generative models.' },
    { keyword: 'Organic brutalist architecture', growth: '+120%', category: 'Design', insight: 'Rising trend in luxury residential aesthetics.' },
    { keyword: 'Short-form video SEO', growth: '+310%', category: 'Marketing', insight: 'Algorithm shifts favoring searchable video titles.' },
    { keyword: 'Sustainable travel gadgets', growth: '+95%', category: 'Lifestyle', insight: 'High intent for eco-friendly adventure gear.' }
  ];

  const visualPrompts = [
    {
      id: 'v1',
      title: 'Hyper-minimal Tech',
      config: {
        toolId: 't2',
        prompt: 'A hyper-minimalist workspace with a single slate desk, floating OLED screen, diffused morning light, 8k cinematic render, beige and grey tones.',
        style: 'Minimalist Line Art'
      },
      image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'v2',
      title: 'Cyberpunk Portrait',
      config: {
        toolId: 't2',
        prompt: 'Portrait of a tech-wear model, neon purple and teal accent lighting, rain droplets on skin, hyper-detailed, unreal engine 5 style.',
        style: 'Cyberpunk'
      },
      image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'v3',
      title: 'Ghibli Inspired Landscape',
      config: {
        toolId: 't2',
        prompt: 'Rolling green hills with a small white cottage, fluffy cumulus clouds, hand-painted Ghibli art style, vibrant and nostalgic.',
        style: 'Anime'
      },
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600'
    }
  ];

  const articleBlueprints = [
    {
      id: 'a1',
      title: "The 'Why Now' Deep Dive",
      config: {
        toolId: 't1',
        prompt: 'Write a high-authority article about [TOPIC]. Explain why this is happening now, the cultural impact, and what the future holds for the next 5 years.',
        style: 'Professional'
      },
      icon: '🖋️'
    },
    {
      id: 'a2',
      title: "The 'Contrarian' Opinion",
      config: {
        toolId: 't1',
        prompt: 'Write a bold, contrarian take on [TOPIC]. Challenge common beliefs, use strong metaphors, and call the reader to rethink their strategy.',
        style: 'Witty'
      },
      icon: '⚡'
    }
  ];

  const handleApplyConfig = (config) => {
    const tool = TOOLS.find((item) => item.id === config.toolId);
    if (!tool) {
      toast.error('Tool not found for this preset.');
      return;
    }
    toast.success(`Config synced. Applying preset to ${tool.name}.`);
    onTryTool(tool, config.prompt, config.style);
  };

  return (
    <div className="py-12 animate-fade-in-up">
      <div className="mb-12">
        <h2 className="text-3xl font-serif text-[#2C2A26] dark:text-[#F5F2EB] mb-2">Inspiration Hub</h2>
        <p className="text-[#5D5A53] dark:text-[#A8A29E] font-light">Explore trends and high-conversion presets.</p>
      </div>

      <div className="flex gap-8 border-b border-[#D6D1C7] dark:border-[#433E38] mb-12 overflow-x-auto no-scrollbar">
        {['trends', 'visual', 'articles', 'social'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'text-[#2C2A26] dark:text-[#F5F2EB] border-b-2 border-[#2C2A26] dark:border-[#F5F2EB]'
                : 'text-[#A8A29E] border-b-2 border-transparent hover:text-[#2C2A26] dark:hover:text-[#F5F2EB]'
            }`}
          >
            {tab === 'trends' && '🔥 Live Pulse'}
            {tab === 'visual' && '🖼️ Visual Library'}
            {tab === 'articles' && '📄 Blueprints'}
            {tab === 'social' && '📱 Viral Hooks'}
          </button>
        ))}
      </div>

      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {googleTrends.map((trend, index) => (
            <div
              key={`${trend.keyword}-${index}`}
              className="bg-white dark:bg-[#2C2A26] border border-[#D6D1C7] dark:border-[#433E38] p-6 rounded-sm hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-red-500 font-bold text-xs">{trend.growth} growth</span>
                <span className="text-[10px] bg-[#F5F2EB] dark:bg-[#1C1B19] px-2 py-1 uppercase tracking-widest">
                  {trend.category}
                </span>
              </div>
              <h4 className="text-xl font-serif mb-2 text-[#2C2A26] dark:text-[#F5F2EB]">{trend.keyword}</h4>
              <p className="text-sm text-[#5D5A53] dark:text-[#A8A29E] mb-6 font-light italic">{trend.insight}</p>
              <button
                onClick={() =>
                  handleApplyConfig({
                    toolId: 't1',
                    prompt: `Write a deep dive about ${trend.keyword}. Context: ${trend.insight}`,
                    style: 'Professional'
                  })
                }
                className="text-[10px] font-bold uppercase tracking-widest text-[#2C2A26] dark:text-[#F5F2EB] border-b border-[#2C2A26] dark:border-[#F5F2EB] pb-1 hover:opacity-60 transition-opacity"
              >
                Create Article from Trend
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'visual' && (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {visualPrompts.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid bg-white dark:bg-[#2C2A26] border border-[#D6D1C7] dark:border-[#433E38] p-4 group relative"
            >
              <div className="relative overflow-hidden mb-4 bg-[#F5F2EB] dark:bg-[#1C1B19]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleApplyConfig(item.config)}
                    className="bg-white text-[#2C2A26] px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform"
                  >
                    Remix this Style
                  </button>
                </div>
              </div>
              <h4 className="font-serif text-lg text-[#2C2A26] dark:text-[#F5F2EB]">{item.title}</h4>
              <p className="text-[10px] text-[#A8A29E] mt-1 uppercase tracking-widest">Style: {item.config.style}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'articles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articleBlueprints.map((item) => (
            <div
              key={item.id}
              className="flex gap-6 p-8 bg-white dark:bg-[#2C2A26] border border-[#D6D1C7] dark:border-[#433E38] hover:border-[#2C2A26] dark:hover:border-[#F5F2EB] transition-all cursor-pointer group"
              onClick={() => handleApplyConfig(item.config)}
            >
              <div className="text-4xl">{item.icon}</div>
              <div>
                <h4 className="text-xl font-serif text-[#2C2A26] dark:text-[#F5F2EB] mb-2">{item.title}</h4>
                <p className="text-sm text-[#5D5A53] dark:text-[#A8A29E] font-light mb-4">
                  Click to load this high-conversion structure into the Editorial tool.
                </p>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2C2A26] dark:text-[#F5F2EB] group-hover:underline">
                  Use Blueprint
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'social' && (
        <div className="bg-[#F5F2EB] dark:bg-[#2C2A26] p-12 text-center border-2 border-dashed border-[#D6D1C7] dark:border-[#433E38]">
          <p className="font-serif italic text-lg text-[#A8A29E]">
            Viral Hook Library arriving in v2.2. Stay tuned for AI-predicted social engagement scores.
          </p>
        </div>
      )}
    </div>
  );
};

export default InspirationGallery;

