import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20 px-6 h-16 border-b flex items-center justify-between"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          boxShadow: '0 2px 12px rgba(26,58,92,0.08)',
        }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-bold transition-all hover:opacity-70 cursor-pointer"
          style={{ color: 'var(--navy)' }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
        <h1 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h1>
        <div className="w-20" />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-8 md:p-12 space-y-8"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <section>
            <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--navy)' }}>Privacy Policy</h2>
            <p className="text-sm text-balance leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Last Updated: April 25, 2026
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>1. What Data is Collected</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We collect information that you provide directly to us, such as your name, email address, and flight instruction data (students, lessons, hours). We also collect payment information through our third-party processor, Stripe.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>2. How Data is Used</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We use your data to provide, maintain, and improve the Service. This includes managing your account, processing payments, and providing the tools necessary for flight instruction tracking. We may also use your contact information to send you updates about the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>3. Data Storage (Supabase)</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Your data is stored securely using Supabase, a backend-as-a-service provider. Supabase employs standard security practices to ensure the integrity and confidentiality of your information.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>4. Payment Processing (Stripe)</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Payments are processed through Stripe. We do not store your full credit card details on our servers. Stripe handles your payment information in accordance with their own security standards and privacy policy.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>5. Cookies and LocalStorage</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We use cookies and localStorage to maintain your session, store your preferences (such as dark mode), and improve your user experience. You can control these through your browser settings.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>6. Data Retention</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We retain your data for as long as your account is active. If you choose to delete your account, your data will be permanently removed from our active databases, subject to any legal requirements to retain certain information.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>7. User Rights</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              You have the right to access, correct, or delete your personal data. You can perform most of these actions directly through your account settings or by contacting us.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>8. Third-Party Services</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We may share your data with third-party service providers (like Supabase and Stripe) only to the extent necessary to provide the Service. We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>9. Contact Information</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              If you have any questions about this Privacy Policy, please contact us at 61trckr@gmail.com.
            </p>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
