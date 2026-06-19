// lib/tag-icons.tsx
import {
  PythonOriginal,
  ReactOriginal,
  JavascriptOriginal,
  JavaPlain,
  NextjsOriginal,
} from 'devicons-react';
import {
  Bot,
  Server,
  Infinity,
  CodeXml,
  Database,
  GitBranch,
  Binary,
  Cloud,
} from 'lucide-react';

export const tagIcons: Record<string, React.ReactNode> = {
  all: <Infinity size={40} />,
  computerArchitecture: <Binary size={40} />,
  data: <Database size={40} />,
  frontend: <CodeXml size={40} />,
  backend: <Server size={40} />,
  cloudService: <Cloud size={40} />,
  ai: <Bot size={40} />,
  git: <GitBranch size={40} />,
  nextjs: <NextjsOriginal size={40} />,
  javascript: <JavascriptOriginal size={40} />,
  python: <PythonOriginal size={40} />,
  react: <ReactOriginal size={40} />,
  java: <JavaPlain size={40} />,
};
