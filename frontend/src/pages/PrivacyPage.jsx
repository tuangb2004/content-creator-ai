import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

function PrivacyPage() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-[#1C1B19] text-[#F5F2EB]' : 'bg-[#F5F2EB] text-[#2C2A26]'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className={`text-4xl font-serif mb-8 ${
          theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
        }`}>
          Privacy Policy
        </h1>
        
        <div className={`prose max-w-none ${
          theme === 'dark' ? 'prose-invert' : ''
        }`}>
          <p className="text-sm mb-8">
            <strong>Last Updated:</strong> January 16, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4 leading-relaxed">
              CreatorAI Studio ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered content creation platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, password</li>
              <li><strong>Profile Information:</strong> Display name, avatar (if provided)</li>
              <li><strong>Payment Information:</strong> Billing details (processed securely through PayOS)</li>
              <li><strong>Content:</strong> Text, projects, and materials you create using our Service</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Information from Third-Party Sign-In</h3>
            <p className="mb-4 leading-relaxed">
              When you sign in using Google, Facebook, or TikTok, we receive:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Basic profile information (name, email, profile picture)</li>
              <li>User ID from the authentication provider</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Usage Data:</strong> Features used, time spent, interactions</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Cookies:</strong> Session cookies for authentication and preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-4 leading-relaxed">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide and maintain the Service</li>
              <li>Process your transactions and manage subscriptions</li>
              <li>Send you updates, security alerts, and support messages</li>
              <li>Improve and personalize your experience</li>
              <li>Analyze usage patterns and optimize the Service</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. AI-Generated Content</h2>
            <p className="mb-4 leading-relaxed">
              Content you generate using our AI tools:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Is stored securely in your account</li>
              <li>Remains your property</li>
              <li>May be used to improve AI models (anonymized)</li>
              <li>Is not shared with third parties without your consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Information Sharing and Disclosure</h2>
            <p className="mb-4 leading-relaxed">
              We do not sell your personal information. We may share information:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Service Providers:</strong> Firebase (hosting), PayOS (payments), Google AI (content generation)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
              <li><strong>Business Transfers:</strong> In connection with merger, sale, or acquisition</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Third-Party Services</h2>
            <p className="mb-4 leading-relaxed">
              Our Service integrates with:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Google:</strong> Authentication, AI services (<a href="https://policies.google.com/privacy" className="underline">Privacy Policy</a>)</li>
              <li><strong>Facebook:</strong> Authentication (<a href="https://www.facebook.com/privacy/policy" className="underline">Privacy Policy</a>)</li>
              <li><strong>TikTok:</strong> Authentication (<a href="https://www.tiktok.com/legal/privacy-policy" className="underline">Privacy Policy</a>)</li>
              <li><strong>Firebase:</strong> Hosting and database (<a href="https://firebase.google.com/support/privacy" className="underline">Privacy Policy</a>)</li>
              <li><strong>PayOS:</strong> Payment processing (<a href="https://payos.vn/privacy" className="underline">Privacy Policy</a>)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
            <p className="mb-4 leading-relaxed">
              We implement security measures including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Encryption of data in transit (HTTPS/SSL)</li>
              <li>Secure password hashing</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Secure cloud infrastructure (Firebase)</li>
            </ul>
            <p className="mb-4 leading-relaxed">
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Your Rights and Choices</h2>
            <p className="mb-4 leading-relaxed">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your content and projects</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails</li>
              <li><strong>Withdraw Consent:</strong> Revoke permissions at any time</li>
            </ul>
            <p className="mb-4 leading-relaxed">
              To exercise these rights, contact us at: <strong>support@creatorai.studio</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
            <p className="mb-4 leading-relaxed">
              We retain your information for as long as:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Your account is active</li>
              <li>Needed to provide the Service</li>
              <li>Required by law or legitimate business purposes</li>
            </ul>
            <p className="mb-4 leading-relaxed">
              When you delete your account, we delete your personal information within 30 days, except data we must retain for legal reasons.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="mb-4 leading-relaxed">
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children. If you are a parent and believe your child has provided us with information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
            <p className="mb-4 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in compliance with applicable laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
            <p className="mb-4 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Posting the new policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending an email notification (for significant changes)</li>
            </ul>
          </section>

          <section id="data-deletion" className="mb-8 scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4">13. Data Deletion Request</h2>
            <p className="mb-4 leading-relaxed">
              You have the right to request deletion of your personal data from CreatorAI Studio. To delete your data:
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li><strong>Log in</strong> to your CreatorAI Studio account</li>
              <li>Navigate to <strong>Settings</strong> → <strong>Account</strong></li>
              <li>Click <strong>"Delete Account"</strong> button</li>
              <li>Confirm the deletion by entering your password</li>
              <li>Your account and all associated data will be permanently deleted within 30 days</li>
            </ol>
            <p className="mb-4 leading-relaxed">
              <strong>Alternative Method:</strong> If you cannot access your account, please contact us at <strong>support@creatorai.studio</strong> with your account email address and we will process your deletion request.
            </p>
            <p className="mb-4 leading-relaxed">
              <strong>Note:</strong> After deletion, all your data including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Account information (email, name, profile)</li>
              <li>Generated content and projects</li>
              <li>Payment history (retained for legal compliance)</li>
              <li>Usage data and analytics</li>
            </ul>
            <p className="mb-4 leading-relaxed">
              will be permanently removed and cannot be recovered. Some data may be retained for legal or regulatory purposes as required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p className="mb-4 leading-relaxed">
              If you have questions about this Privacy Policy or our practices, please contact us:
            </p>
            <p className="mb-2">
              <strong>Email:</strong> support@creatorai.studio
            </p>
            <p className="mb-2">
              <strong>Website:</strong> https://content-creator-ai-wheat.vercel.app
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. GDPR Compliance (EU Users)</h2>
            <p className="mb-4 leading-relaxed">
              If you are in the European Economic Area (EEA), you have additional rights under GDPR, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Right to data portability</li>
              <li>Right to restrict processing</li>
              <li>Right to object to processing</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
