import { Reveal } from './Reveal';
import { useLanguage } from '../../contexts/LanguageContext';
import technologyImage from '../../assets/images/Technology.jpeg';

const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="bg-[#EBE7DE] dark:bg-gray-800 transition-colors duration-300">
      
      {/* Introduction / Story */}
      <div className="py-24 px-6 md:px-12 max-w-[1800px] mx-auto flex flex-col md:flex-row items-start gap-16 md:gap-32">
        <div className="md:w-1/3">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-serif text-[#2C2A26] dark:text-gray-100 leading-tight whitespace-pre-wrap transition-colors duration-300">
                {t?.about?.title_1 || 'The Operating System \n for Creators.'}
            </h2>
          </Reveal>
        </div>
        <div className="md:w-2/3 max-w-2xl">
          <Reveal delay={200}>
            <p className="text-lg md:text-xl text-[#5D5A53] dark:text-gray-300 font-light leading-relaxed mb-8 transition-colors duration-300">
                {t?.about?.desc_1 || 'CreatorAI was built to solve the "Blank Page Problem." We believe that creativity is not a lightning strike, but a workflow. By combining Large Language Models with intuitive design, we give you a studio that never sleeps.'}
            </p>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-lg md:text-xl text-[#5D5A53] dark:text-gray-300 font-light leading-relaxed mb-8 transition-colors duration-300">
                {t?.about?.desc_2 || 'Whether you are a solo marketer managing 5 channels or a founder building a personal brand, our tools adapt to your voice, scaling your output without diluting your message.'}
            </p>
          </Reveal>
          
          <Reveal delay={400}>
            <div className="mt-12">
                <img 
                    src={new URL('../../assets/images/SaaS.jpeg', import.meta.url).href}
                    alt="Modern Creator Workspace" 
                    className="w-full h-[400px] object-cover sepia-[0.15] contrast-[0.92] brightness-[0.98] saturate-[0.85]"
                />
            </div>
          </Reveal>
        </div>
      </div>

      {/* Philosophy Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
        <div className="order-2 lg:order-1 relative h-[500px] lg:h-auto overflow-hidden group">
            <Reveal className="h-full w-full">
                <img 
                    src={technologyImage}
                    alt="Technology illustration" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 sepia-[0.12] contrast-[0.95] brightness-[0.96] saturate-[0.9]"
                />
            </Reveal>
        </div>
        <div className="order-1 lg:order-2 flex flex-col justify-center p-12 lg:p-24 bg-[#D6D1C7] dark:bg-gray-700 transition-colors duration-300">
           <Reveal delay={100}>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5D5A53] mb-6 block">{t?.about?.tech_badge || 'Technology'}</span>
                <h3 className="text-4xl md:text-5xl font-serif mb-8 text-[#2C2A26] dark:text-gray-100 leading-tight whitespace-pre-wrap transition-colors duration-300">
                    {t?.about?.tech_title || 'Powered by \n Multi-Model AI'}
                </h3>
                <p className="text-lg text-[#5D5A53] dark:text-gray-300 font-light leading-relaxed mb-12 max-w-md transition-colors duration-300">
                    {t?.about?.tech_desc || 'We route each request to the best model for the job—fast text generation with Groq, deep reasoning with Gemini, and high-quality image generation with Stability or Gemini. The result: reliable output tailored to your workflow.'}
                </p>
           </Reveal>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
        <div className="flex flex-col justify-center p-12 lg:p-24 bg-[#2C2A26] dark:bg-gray-900 text-[#F5F2EB] dark:text-gray-100 transition-colors duration-300">
           <Reveal delay={100}>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-6 block">{t?.about?.work_badge || 'Workflow'}</span>
                <h3 className="text-4xl md:text-5xl font-serif mb-8 text-[#F5F2EB] leading-tight">
                    {t?.about?.work_title || 'Create, Save, Reuse.'}
                </h3>
                <p className="text-lg text-[#A8A29E] font-light leading-relaxed mb-12 max-w-md">
                    {t?.about?.work_desc || 'Save every generation as a project, organize it by tool, and reuse it across campaigns. Copy instantly, export when needed, and keep your creative history in one place.'}
                </p>
           </Reveal>
        </div>
        <div className="relative h-[500px] lg:h-auto overflow-hidden group">
            <Reveal className="h-full w-full">
                <img 
                    src={new URL('../../assets/images/Creativity.jpeg', import.meta.url).href}
                    alt="Digital Network" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 sepia-[0.18] contrast-[0.93] brightness-[0.94] saturate-[0.88]"
                />
            </Reveal>
        </div>
      </div>
    </section>
  );
};

export default About;

