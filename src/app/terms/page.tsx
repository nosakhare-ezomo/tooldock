import React from "react";

export default function TermsOfService() {
  return (
    <div className="flex flex-col items-center pb-24 w-full">
      <header className="w-full text-center py-20 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-lg opacity-70">
          Last updated: {new Date().toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </header>

      <div className="w-full max-w-3xl liquid-glass-card p-8 md:p-12 prose prose-slate dark:prose-invert">
        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing or using ToolDock, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.
        </p>

        <h2>2. Use License</h2>
        <p>
          ToolDock grants you a personal, non-exclusive, non-transferable, revocable license to access and use the website strictly in accordance with these Terms.
        </p>

        <h2>3. Pro/Premium Subscriptions</h2>
        <p>
          If you purchase a Pro subscription, you agree to pay all applicable fees. Subscriptions automatically renew unless canceled before the renewal date. You can cancel at any time. We reserve the right to change our pricing upon giving reasonable notice.
        </p>

        <h2>4. Disclaimer</h2>
        <p>
          The materials on ToolDock are provided on an 'as is' basis. ToolDock makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>

        <h2>5. Limitations</h2>
        <p>
          In no event shall ToolDock or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ToolDock's website.
        </p>

        <h2>6. Revisions and Errata</h2>
        <p>
          The materials appearing on ToolDock's website could include technical, typographical, or photographic errors. ToolDock does not warrant that any of the materials on its website are accurate, complete or current.
        </p>
      </div>
    </div>
  );
}
