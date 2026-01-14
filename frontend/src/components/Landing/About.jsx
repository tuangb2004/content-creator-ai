import { Reveal } from './Reveal';
import { useLanguage } from '../../contexts/LanguageContext';

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
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" 
                    alt="Modern Creator Workspace" 
                    className="w-full h-[400px] object-cover grayscale contrast-[0.9] brightness-110"
                />
                <p className="text-sm font-medium uppercase tracking-widest text-[#A8A29E] mt-4">
                    CreatorAI Labs, San Francisco
                </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Philosophy Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
        <div className="order-2 lg:order-1 relative h-[500px] lg:h-auto overflow-hidden group">
            <Reveal className="h-full w-full">
                <img 
                    src="https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&q=80&w=1200" 
                    alt="Server Rack Abstract" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
            </Reveal>
        </div>
        <div className="order-1 lg:order-2 flex flex-col justify-center p-12 lg:p-24 bg-[#D6D1C7] dark:bg-gray-700 transition-colors duration-300">
           <Reveal delay={100}>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5D5A53] mb-6 block">{t?.about?.tech_badge || 'Technology'}</span>
                <h3 className="text-4xl md:text-5xl font-serif mb-8 text-[#2C2A26] dark:text-gray-100 leading-tight whitespace-pre-wrap transition-colors duration-300">
                    {t?.about?.tech_title || 'Powered by \n Gemini 2.5'}
                </h3>
                <p className="text-lg text-[#5D5A53] dark:text-gray-300 font-light leading-relaxed mb-12 max-w-md transition-colors duration-300">
                    {t?.about?.tech_desc || 'Under the hood, we utilize Google\'s most advanced multimodal models. This allows CreatorAI to "see" images, understand complex nuance in text, and reason through strategy better than previous generations of AI.'}
                </p>
           </Reveal>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
        <div className="flex flex-col justify-center p-12 lg:p-24 bg-[#2C2A26] dark:bg-gray-900 text-[#F5F2EB] dark:text-gray-100 transition-colors duration-300">
           <Reveal delay={100}>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-6 block">{t?.about?.work_badge || 'Workflow'}</span>
                <h3 className="text-4xl md:text-5xl font-serif mb-8 text-[#F5F2EB] leading-tight">
                    {t?.about?.work_title || 'Export & Publish.'}
                </h3>
                <p className="text-lg text-[#A8A29E] font-light leading-relaxed mb-12 max-w-md">
                    {t?.about?.work_desc || 'Your content shouldn\'t live in a silo. Save your projects, export to PDF/DOCX, or copy directly to your CMS. We focus on the "last mile" of creation—getting your work out there.'}
                </p>
           </Reveal>
        </div>
        <div className="relative h-[500px] lg:h-auto overflow-hidden group">
            <Reveal className="h-full w-full">
                <img 
                    src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200" 
                    alt="Digital Network" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 brightness-90"
                />
            </Reveal>
        </div>
      </div>
    </section>
  );
};

export default About;

