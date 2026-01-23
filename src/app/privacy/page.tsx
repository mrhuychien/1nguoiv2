import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | 1nguoi',
  description: 'Privacy Policy for 1nguoi platform - How we collect, use, and protect your data',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert prose-slate max-w-none">
          <p className="text-slate-300 text-lg mb-6">
            Last updated: January 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-slate-300">
              1nguoi (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-medium text-white mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
              <li>Account information (email, name, password)</li>
              <li>Profile information you choose to provide</li>
              <li>Content you create using our tools</li>
              <li>Communications with us</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Usage patterns and preferences</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-300 mb-4">We use the collected information to:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Process your transactions</li>
              <li>Send you updates and notifications</li>
              <li>Improve and personalize your experience</li>
              <li>Analyze usage and optimize our platform</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. AI and Data Processing</h2>
            <p className="text-slate-300">
              When you use our AI features, your inputs are processed by AI models to generate responses.
              We may use aggregated, anonymized data to improve our AI capabilities. Your specific
              conversations are not used to train AI models without your explicit consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Sharing</h2>
            <p className="text-slate-300 mb-4">We may share your information with:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li><strong>Service Providers:</strong> Third parties that help us operate our platform</li>
              <li><strong>AI Providers:</strong> To process AI requests (OpenAI, Anthropic, Google, etc.)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
            </ul>
            <p className="text-slate-300 mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data Security</h2>
            <p className="text-slate-300">
              We implement appropriate technical and organizational measures to protect your data,
              including encryption, secure servers, and access controls. However, no method of
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
            <p className="text-slate-300">
              We retain your data for as long as your account is active or as needed to provide
              services. You can request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Your Rights</h2>
            <p className="text-slate-300 mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
              <li>Restrict or object to processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Cookies</h2>
            <p className="text-slate-300">
              We use cookies and similar technologies to enhance your experience, remember preferences,
              and analyze traffic. You can control cookies through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-slate-300">
              Our services are not intended for users under 13 years of age. We do not knowingly
              collect information from children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">11. International Transfers</h2>
            <p className="text-slate-300">
              Your data may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to This Policy</h2>
            <p className="text-slate-300">
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by posting the new policy on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
            <p className="text-slate-300">
              If you have questions about this Privacy Policy or our data practices, please contact us at{' '}
              <a href="mailto:privacy@1nguoi.com" className="text-purple-400 hover:text-purple-300">
                privacy@1nguoi.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700">
          <Link href="/terms" className="text-purple-400 hover:text-purple-300">
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  )
}
