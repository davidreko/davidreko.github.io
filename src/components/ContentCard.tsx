"use client";

import { about, jobs, education, skills, socialLinks, type SkillCategory } from "@/data/resume";

interface RunStats {
  elapsed: number;
  crashes: number;
  visited: number;
  totalZones: number;
}

interface ContentCardProps {
  zoneId: string;
  onClose: () => void;
  stats?: RunStats;
  onViewResume?: () => void;
  onPlayAgain?: () => void;
}

export default function ContentCard({ zoneId, onClose, stats, onViewResume, onPlayAgain }: ContentCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 animate-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-lg transition-colors"
        >
          ×
        </button>

        <div className="text-xs text-slate-400 mb-4 uppercase tracking-wide">
          Press SPACE or ESC to close
        </div>

        {zoneId === "about" && <AboutContent />}
        {zoneId === "experience" && <ExperienceContent />}
        {zoneId === "education" && <EducationContent />}
        {zoneId === "skills" && <SkillsContent />}
        {zoneId === "projects" && <ProjectsContent />}
        {zoneId === "contact" && <ContactContent stats={stats} onViewResume={onViewResume} onPlayAgain={onPlayAgain} />}
      </div>
    </div>
  );
}

function AboutContent() {
  return (
    <>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">{about.name}</h2>
      <p className="text-lg text-sky-600 font-medium mb-4">{about.title}</p>
      <p className="text-slate-600 leading-relaxed">{about.summary}</p>
    </>
  );
}

function ExperienceContent() {
  return (
    <>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Experience</h2>
      {jobs.map((job, i) => (
        <div key={i} className={i > 0 ? "mt-8 pt-8 border-t border-slate-200" : ""}>
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-xl font-bold text-slate-800">{job.company}</h3>
            <span className="text-sm text-slate-400">{job.location}</span>
          </div>
          <p className="text-sm text-slate-500 mb-4">{job.companyDesc}</p>

          {job.roles.map((role, j) => (
            <div key={j} className={j > 0 ? "mt-5 pt-5 border-t border-slate-100" : ""}>
              <div className="flex items-baseline justify-between mb-2">
                <h4 className="text-base font-semibold text-slate-700">
                  {role.title}
                </h4>
                <span className="text-xs text-slate-400">{role.period}</span>
              </div>
              <ul className="space-y-1.5">
                {role.bullets.map((b, k) => (
                  <li key={k} className="text-sm text-slate-600 leading-relaxed flex gap-2">
                    <span className="text-sky-500 mt-0.5 flex-shrink-0">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function EducationContent() {
  return (
    <>
      <h2 className="text-3xl font-bold text-slate-800 mb-4">Education</h2>
      <h3 className="text-xl font-bold text-slate-700">{education.school}</h3>
      <p className="text-slate-500 text-sm mb-2">{education.location}</p>
      <p className="text-lg text-slate-700">{education.degree}</p>
      <p className="text-sm text-slate-400">{education.period}</p>
    </>
  );
}

function SkillsContent() {
  return (
    <>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Skills & Tech</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {skills.map((cat, i) => (
          <div key={i}>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
              {cat.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((s, j) => (
                <span
                  key={j}
                  className="px-3 py-1 bg-sky-50 text-sky-700 text-sm rounded-lg border border-sky-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ProjectsContent() {
  return (
    <>
      <h2 className="text-3xl font-bold text-slate-800 mb-4">Projects</h2>
      <div className="text-center py-8">
        <p className="text-slate-400 text-lg">Trails under construction</p>
        <p className="text-slate-300 mt-2">Check back soon for project showcases</p>
      </div>
    </>
  );
}

function ContactContent({ stats, onViewResume, onPlayAgain }: { stats?: RunStats; onViewResume?: () => void; onPlayAgain?: () => void }) {
  return (
    <>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Base Lodge</h2>

      {stats && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Run Summary
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {Math.floor(stats.elapsed / 60000)}:
                {Math.floor((stats.elapsed % 60000) / 1000)
                  .toString()
                  .padStart(2, "0")}
              </div>
              <div className="text-xs text-slate-400">Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {stats.crashes}
              </div>
              <div className="text-xs text-slate-400">Crashes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {stats.visited}/{stats.totalZones}
              </div>
              <div className="text-xs text-slate-400">Lodges</div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-sm text-slate-600 leading-relaxed mb-3">{about.summary}</p>
        <div className="flex flex-wrap gap-1.5">
          {skills.flatMap((cat: SkillCategory) => cat.items.slice(0, 3)).map((s: string, i: number) => (
            <span key={i} className="px-2 py-0.5 bg-sky-50 text-sky-700 text-xs rounded border border-sky-200">
              {s}
            </span>
          ))}
        </div>
      </div>

      <p className="text-slate-500 mb-6">
        Thanks for skiing with me! Let&apos;s connect.
      </p>
      <div className="flex gap-4">
        <a
          href={socialLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </a>
        <a
          href={socialLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </a>
      </div>

      {(onViewResume || onPlayAgain) && (
        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
          {onViewResume && (
            <button
              onClick={onViewResume}
              className="flex-1 px-4 py-2.5 bg-sky-50 text-sky-700 font-medium rounded-xl hover:bg-sky-100 transition-colors text-sm border border-sky-200"
            >
              View Full Resume
            </button>
          )}
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="flex-1 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-xl hover:bg-amber-100 transition-colors text-sm border border-amber-200"
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </>
  );
}
