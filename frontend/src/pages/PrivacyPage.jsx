import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

function PrivacyPage() {
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
          {t.legal.privacyTitle}
        </h1>

        <div className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''
          }`}>
          <p className="text-sm mb-8">
            <strong>{t.legal.lastUpdated}:</strong> January 16, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.s1Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.privacy.s1Content}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.s2Title}</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">{t.legal.privacy.s2_1Title}</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {t.legal.privacy.s2_1List.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">{t.legal.privacy.s2_2Title}</h3>
            <p className="mb-4 leading-relaxed">
              {t.legal.privacy.s2_2Content}
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {t.legal.privacy.s2_2List.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">{t.legal.privacy.s2_3Title}</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {t.legal.privacy.s2_3List.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.s3Title}</h2>
            <p className="mb-4 leading-relaxed">{t.legal.privacy.s3Content}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {t.legal.privacy.s3List.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.s4Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.privacy.s4Content}
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {t.legal.privacy.s4List.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.s5Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.privacy.s5Content}
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {t.legal.privacy.s5List.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.s6Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.privacy.s6Content}
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {t.legal.privacy.s6List.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.s7Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.privacy.s7Content1}
            </p>
            <p className="mb-4 leading-relaxed">
              {t.legal.privacy.s7Content2}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.s8Title}</h2>
            <p className="mb-4 leading-relaxed">{t.legal.privacy.s8Content}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {t.legal.privacy.s8List.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.s9Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.privacy.s9Content}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.s10Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.privacy.s10Content}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.s11Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.privacy.s11Content}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.s12Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.privacy.s12Content}
            </p>
          </section>

          <section id="data-deletion" className="mb-8 scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.s13Title}</h2>
            <p className="mb-4 leading-relaxed">
              {t.legal.privacy.s13Content}
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              {t.legal.privacy.s13Steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
