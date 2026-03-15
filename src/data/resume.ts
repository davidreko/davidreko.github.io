export type RunDifficulty = "green" | "blue" | "black" | "doubleBlack";

export interface Job {
  company: string;
  location: string;
  companyDesc: string;
  roles: {
    title: string;
    period: string;
    bullets: string[];
  }[];
  runName: string;
  runDifficulty: RunDifficulty;
}

export interface Education {
  school: string;
  location: string;
  degree: string;
  period: string;
  runName: string;
  runDifficulty: RunDifficulty;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export const about = {
  name: "David Reko",
  title: "Software Engineer - Generative AI",
  summary:
    "Software engineer specializing in production-grade agentic LLM systems and AI-powered developer tooling. Experienced designing multi-step code generation workflows, improving model output quality through prompt and dataset iteration, and shipping enterprise-scale AI features embedded in real-world development environments.",
};

export const jobs: Job[] = [
  {
    company: "ServiceNow",
    location: "San Diego, CA",
    companyDesc:
      "Enterprise software company specializing in automating business workflows",
    roles: [
      {
        title: "Software Engineer (IC2)",
        period: "February 2024 – Present",
        bullets: [
          "Contributed to the development of the Build Agent, an agentic coding assistant delivered as a VS Code browser plugin, translating natural language prompts into full applications through multi-step LLM workflows and platform-specific API integrations.",
          "Developed a RAG-based code assistance tool using TypeScript and the ServiceNow SDK, enhancing LLM responses for code auto-complete and code explanation, with a successful launch on the ServiceNow Store.",
          "Engineered prompts and optimized model outputs for the initial release of code auto-complete for ServiceNow scripting, improving acceptance rates and reliability of LLM-generated code.",
          "Designed a scalable data pipeline using Node.js, TypeScript, and NPM to extract, process, and format 900,000 high-quality code samples for fine-tuning and evaluation of LLM models.",
        ],
      },
      {
        title: "Associate Software Engineer (IC1)",
        period: "August 2022 – February 2024",
        bullets: [
          "Modified high-traffic legacy Java code to integrate new functionality, ensuring seamless operation for a new ServiceNow application deployment feature.",
          "Created applications for manual testing of new application file loading and packaging structure as part of a major development initiative.",
          "Diagnosed and resolved production defects and platform issues, supporting internal teams and external customers while improving system reliability.",
        ],
      },
    ],
    runName: "Black Diamond Peak",
    runDifficulty: "black",
  },
  {
    company: "L3Harris Technologies",
    location: "Salt Lake City, UT",
    companyDesc:
      "Defense contractor — Communication Systems West division",
    roles: [
      {
        title: "Software Engineering Intern",
        period: "Summers 2019 – 2021",
        bullets: [
          "Three consecutive summer internships focusing on testing, automation, and tool creation for communication systems.",
        ],
      },
    ],
    runName: "Blue Square Run",
    runDifficulty: "blue",
  },
];

export const education: Education = {
  school: "California Polytechnic State University — San Luis Obispo",
  location: "San Luis Obispo, CA",
  degree: "Bachelor of Science in Computer Science",
  period: "September 2018 – June 2022",
  runName: "The Lodge",
  runDifficulty: "blue",
};

export const skills: SkillCategory[] = [
  {
    category: "Languages",
    items: ["TypeScript", "JavaScript", "Java", "Python", "Node.js"],
  },
  {
    category: "AI / ML",
    items: [
      "LLM Prompt Engineering",
      "RAG Systems",
      "Agentic Workflows",
      "MCP Servers",
      "Fine-tuning Pipelines",
      "Code Generation",
    ],
  },
  {
    category: "Frameworks & Tools",
    items: ["React", "Next.js", "VS Code Extensions", "ServiceNow SDK", "NPM", "Git"],
  },
];

export interface Project {
  name: string;
  description: string;
  tech: string[];
  link?: string;
}

export const projects: Project[] = [
  {
    name: "Spore",
    description:
      "A self-evolving AI agent that starts with nothing but a system prompt and a shell tool. It builds its own tools, rewrites its own prompt, and can modify its own source code - all live, no restart needed.",
    tech: ["TypeScript", "Bun", "Anthropic SDK", "Zod"],
    link: "https://github.com/davidreko/spore",
  },
  {
    name: "Portfolio Mountain",
    description:
      "An interactive SkiFree-inspired portfolio built with Next.js and Canvas 2D. Ski down a mountain to explore resume content in lodges, with procedural terrain, collision physics, and Web Audio sound effects.",
    tech: ["Next.js", "React", "TypeScript", "Canvas 2D", "Web Audio API", "Tailwind CSS"],
    link: "https://github.com/davidreko/davidreko.github.io",
  },
];

export const socialLinks = {
  github: "https://github.com/davidreko",
  linkedin: "https://linkedin.com/in/davidreko",
};
