import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

function TermsPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#1C1B19] text-[#F5F2EB]' : 'bg-[#F5F2EB] text-[#2C2A26]'
      }`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-sm hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          {t.common.back}
        </button>

        <h1 className={`text-4xl font-serif mb-8 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
          }`}>
          {t.legal.termsTitle}
        </h1>

        <div className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''
          }`}>
          <p className="text-sm mb-8">
            <strong>{t.legal.lastUpdated}:</strong> January 16, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.terms.s1Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s1Content}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.terms.s2Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s2Content}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.terms.s3Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s3Content}
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {t.legal.terms.s3List.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.terms.s4Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s4Content}
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {t.legal.terms.s4List.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.terms.s5Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s5Content}
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {t.legal.terms.s5List.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.terms.s6Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s6Content1}
            </p>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s6Content2}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.terms.s7Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s7Content}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.terms.s8Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s8Content}
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {t.legal.terms.s8List.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.terms.s9Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s9Content}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.terms.s10Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s10Content}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.terms.s11Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s11Content}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.terms.s12Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s12Content}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.terms.s13Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.terms.s13Content}
            </p>
            <p className="mb-2">
              <strong>{t.legal.terms.email}:</strong> support@creatorai.studio
            </p>
            <p className="mb-2">
              <strong>{t.legal.terms.website}:</strong> https://content-creator-ai-wheat.vercel.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
