import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer role="contentinfo" className="bg-stone-900 text-stone-300 mt-auto border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-7 h-7 bg-white text-stone-900 rounded font-bold text-xs flex items-center justify-center">
                P21
              </span>
              <span className="text-white font-semibold text-base">
                National Scheme Advisor
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-lg">
              P21 is an AI-powered advisory system designed to assist Indian entrepreneurs, micro-enterprises, and startup founders in navigating Central Government schemes. All eligibility evaluations are deterministic and grounded in official Gazette criteria and ministry notifications.
            </p>
            <div className="flex items-center space-x-2 text-xs text-stone-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Independent, deterministic matching with zero fabricated facts.</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Key Portals
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <a
                  href="https://www.myscheme.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center"
                >
                  MyScheme National Portal
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://udyamregistration.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center"
                >
                  Udyam Registration Portal
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.startupindia.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center"
                >
                  Startup India Hub
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.standupmitra.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center"
                >
                  Stand-Up Mitra Portal
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Access & Governance
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/schemes" className="hover:text-white">
                  Scheme Discovery
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-white">
                  Entrepreneur Portal
                </Link>
              </li>
              <li>
                <Link to="/auth/admin-login" className="hover:text-white">
                  Official Admin Login
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white">
                  Matrix Comparison
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-300">
          <p>© 2026 P21 National Scheme Advisor. University Demonstration Release.</p>
          <p className="mt-2 sm:mt-0 text-stone-400">
            Informational advisory tool. Does not guarantee government sanction or disbursement.
          </p>
        </div>
      </div>
    </footer>
  );
};
