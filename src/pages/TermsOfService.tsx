import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function TermsOfService() {
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
        <h1 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Terms of Service</h1>
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
            <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--navy)' }}>Terms of Service</h2>
            <p className="text-sm text-balance leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Last Updated: April 25, 2026
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>1. Acceptance of Terms</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              By accessing and using 61 Tracker ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. 61 Tracker is a product of 61 Tracker ("Company", "we", "us", or "our").
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>2. Description of Service</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              61 Tracker provides a flight instruction management platform including student progress tracking, lesson logging, and endorsement generation. The service is designed for Certified Flight Instructors (CFIs) and their students.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>3. User Accounts</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              To use most features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must be at least 18 years of age to create an account.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>4. Subscription Billing and Cancellation</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We use Stripe for payment processing. Subscription fees are billed in advance on a monthly or annual basis and are non-refundable. You can cancel your subscription at any time through the Account settings. Upon cancellation, your subscription will remain active until the end of the current billing period.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>5. Free Trial</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We may offer a free trial period for our paid plans. If you do not cancel before the end of the trial period, you will be automatically charged the subscription fee for the plan you selected.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>6. Data Storage and Security</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We use Supabase for data storage and management. We implement industry-standard security measures to protect your data, but we cannot guarantee absolute security. You are responsible for maintaining backups of your critical data.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>7. Prohibited Uses</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the Service. This includes but is not limited to: uploading malware, attempting to gain unauthorized access to our systems, or using the Service to harass others.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>8. Intellectual Property</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              All content and software included in the Service, such as text, graphics, logos, and code, are the property of 61 Tracker and are protected by copyright and other laws. You may not reproduce, modify, or distribute any part of the Service without our prior written consent.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>9. Limitation of Liability</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              61 Tracker shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service. We provide the Service "as is" without any warranty of any kind.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>10. Contact Information</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              If you have any questions about these Terms, please contact us at 61trckr@gmail.com.
            </p>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
