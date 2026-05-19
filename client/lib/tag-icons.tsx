// lib/tag-icons.tsx
import { PythonOriginal, ReactOriginal, JavascriptOriginal, JavaPlain, NextjsOriginal } from 'devicons-react';
import { Bot, Server, Infinity, CodeXml, CloudSync, Database, GitBranch, Binary } from 'lucide-react';

export const tagIcons: Record<string, React.ReactNode> = {
  All: <Infinity size={40} />,
"Computer Architecture": <Binary size={40}/>,
  Data: <Database size={40} />,
  Frontend: <CodeXml size={40} />,
  Backend: <Server size={40} />,
  'Cloud Service': <CloudSync size={40} />,
  AI: <Bot size={40} />,
  Git: <GitBranch size={40}/>,
  'Next.js': <NextjsOriginal size={40}/>,
  JavaScript: <JavascriptOriginal size={40} />,
  Python: <PythonOriginal size={40} />,
  React: <ReactOriginal size={40} />,
  Java: <JavaPlain size={40} />,
};
