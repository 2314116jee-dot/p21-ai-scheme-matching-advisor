import React from 'react';

export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold tracking-wide"
    >
      Skip to main content
    </a>
  );
};
