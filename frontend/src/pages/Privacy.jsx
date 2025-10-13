import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#0b0f14] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/login" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <h1 className="text-4xl font-bold neon-text mb-4">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, including:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Account information (username, email, password)</li>
                <li>Profile information (avatar, bio, preferences)</li>
                <li>Content you create (posts, comments, games)</li>
                <li>Usage data (pages visited, features used)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Personalize your experience</li>
                <li>Send you updates and marketing communications</li>
                <li>Protect against fraud and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">3. Information Sharing</h2>
              <p>We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Service providers who help us operate our platform</li>
                <li>Law enforcement when required by law</li>
                <li>Other users (only information you choose to make public)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">4. Data Security</h2>
              <p>We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Opt out of marketing communications</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">6. Cookies</h2>
              <p>We use cookies and similar technologies to enhance your experience and collect usage data. You can control cookies through your browser settings.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">7. Children's Privacy</h2>
              <p>Our service is not intended for children under 13. We do not knowingly collect information from children under 13.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">8. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of significant changes.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">9. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, contact us at privacy@gamekillerstudio.com</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
