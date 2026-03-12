"use client";

import { about, jobs, education, skills, socialLinks } from "@/data/resume";

interface ResumePageProps {
  onClose: () => void;
  onStartGame: () => void;
}

export default function ResumePage({ onClose, onStartGame }: ResumePageProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">{about.name}</h1>
          <p className="text-xl text-sky-400">{about.title}</p>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto leading-relaxed">
            {about.summary}
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </div>

        {/* Experience */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">
            Experience
          </h2>
          {jobs.map((job, i) => (
            <div key={i} className={i > 0 ? "mt-8" : ""}>
              <div className="flex items-baseline justify-between mb-1 flex-wrap gap-x-4">
                <h3 className="text-lg font-bold text-white">{job.company}</h3>
                <span className="text-sm text-slate-500">{job.location}</span>
              </div>
              <p className="text-sm text-slate-500 mb-3">{job.companyDesc}</p>
              {job.roles.map((role, j) => (
                <div key={j} className={j > 0 ? "mt-4" : ""}>
                  <div className="flex items-baseline justify-between mb-2 flex-wrap gap-x-4">
                    <h4 className="text-base font-semibold text-slate-300">
                      {role.title}
                    </h4>
                    <span className="text-xs text-slate-500">{role.period}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {role.bullets.map((b, k) => (
                      <li
                        key={k}
                        className="text-sm text-slate-400 leading-relaxed flex gap-2"
                      >
                        <span className="text-sky-500 mt-0.5 flex-shrink-0">
                          &bull;
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </section>

        {/* Education */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
            Education
          </h2>
          <h3 className="text-lg font-bold text-white">{education.school}</h3>
          <p className="text-slate-500 text-sm mb-1">{education.location}</p>
          <p className="text-slate-300">{education.degree}</p>
          <p className="text-sm text-slate-500">{education.period}</p>
        </section>

        {/* Skills */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">
            Skills & Tech
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skills.map((cat, i) => (
              <div key={i}>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">
                  {cat.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((s, j) => (
                    <span
                      key={j}
                      className="px-3 py-1 bg-sky-900/40 text-sky-300 text-sm rounded-lg border border-sky-800/50"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom actions */}
        <div className="text-center border-t border-slate-700 pt-8">
          <button
            onClick={onStartGame}
            className="px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-400 active:bg-amber-400 transition-colors text-lg"
          >
            Start Skiing
          </button>
          <button
            onClick={onClose}
            className="ml-4 px-6 py-3 text-slate-400 hover:text-white transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
