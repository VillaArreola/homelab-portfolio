"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import Link from "next/link";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user already accepted
    const accepted = localStorage.getItem("cookiesAccepted");
    if (!accepted) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setIsVisible(false);
  };

  const handleDismiss = () => {
    // Just hide it, they can still use the site
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <Cookie className="text-amber-400 mt-1 flex-shrink-0" size={24} />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-100 mb-2">
              We use localStorage
            </h3>
            <p className="text-sm text-slate-400 mb-3">
              This site uses browser localStorage (not cookies) to save your layout preferences and admin session. 
              No tracking or personal data collection.{" "}
              <Link 
                href="/terms" 
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Learn more
              </Link>
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Got it
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-slate-400 hover:text-slate-200 text-sm transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
