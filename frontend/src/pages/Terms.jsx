import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
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
          <h1 className="text-4xl font-bold neon-text mb-4">Terms of Service</h1>
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using Game Killers Studio ("GKS"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">2. User Accounts</h2>
              <p>You are responsible for maintaining the security of your account. You must provide accurate information and keep your password secure. You are responsible for all activities that occur under your account.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">3. Content & Conduct</h2>
              <p>You agree not to post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. We reserve the right to remove any content that violates these terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">4. Intellectual Property</h2>
              <p>All content on GKS, including text, graphics, logos, and software, is the property of GKS or its content suppliers and is protected by copyright and other intellectual property laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">5. Subscriptions & Payments</h2>
              <p>Subscription fees are billed in advance on a recurring basis. You can cancel your subscription at any time. Refunds are provided at our discretion.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">6. Limitation of Liability</h2>
              <p>GKS is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">7. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the platform.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">8. Contact</h2>
              <p>If you have questions about these Terms, please contact us at support@gamekillerstudio.com</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
