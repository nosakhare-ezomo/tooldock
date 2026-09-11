import React from "react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col items-center pb-24 w-full">
      <header className="w-full text-center py-20 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg opacity-70">
          Last updated: {new Date().toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </header>

      <div className="w-full max-w-3xl liquid-glass-card p-8 md:p-12 prose prose-slate dark:prose-invert">
        <div className="flex items-center gap-4 p-6 bg-primary-500/10 rounded-xl border border-primary-500/20 mb-8 not-prose">
          <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white shrink-0">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div>
            <h3 className="font-bold text-lg m-0">The Short Version</h3>
            <p className="m-0 mt-1 opacity-80 text-sm leading-relaxed">
              For all our file processing tools (PDF, Image, Text), your files never leave your device. The processing happens entirely in your web browser. We cannot see, store, or access your files.
            </p>
          </div>
        </div>

        <h2>1. Introduction</h2>
        <p>
          ToolDock ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. 
          This privacy policy will inform you as to how we look after your personal data when you visit our website 
          and tell you about your privacy rights.
        </p>

        <h2>2. How Our Tools Work (Local Processing)</h2>
        <p>
          The core philosophy of ToolDock is privacy through architecture. 
          The vast majority of our tools utilize WebAssembly and HTML5 technologies to process your files 
          <strong> locally on your device</strong>. 
        </p>
        <ul>
          <li><strong>No Uploads:</strong> Your PDFs, images, and texts are not uploaded to our servers.</li>
          <li><strong>No Storage:</strong> Because files never reach our servers, we have no files to store, sell, or lose.</li>
          <li><strong>Passwords:</strong> Generated passwords are created using your device's secure random number generator and are never transmitted over the network.</li>
        </ul>

        <h2>3. Data We Do Collect</h2>
        <p>
          While we don't collect your files, we may collect some basic information to keep the site running:
        </p>
        <ul>
          <li><strong>Analytics:</strong> Anonymous usage data (e.g., page views, which tools are popular) to help us improve the product.</li>
          <li><strong>Account Information:</strong> If you choose to upgrade to a Pro account (coming soon), we will collect your email address and payment history. Payment details are securely handled by our payment provider (e.g., Stripe) and do not touch our servers.</li>
          <li><strong>Cookies:</strong> Essential cookies for user authentication and preferences (like dark mode).</li>
        </ul>

        <h2>4. Advertising</h2>
        <p>
          Free users may see advertisements. Our ad partners may use cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising by visiting your Google Ad Settings or opting out of third-party vendor's use of cookies.
        </p>

        <h2>5. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
        </p>

        <h2>6. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@tooldock.com">privacy@tooldock.com</a>.
        </p>
      </div>
    </div>
  );
}
