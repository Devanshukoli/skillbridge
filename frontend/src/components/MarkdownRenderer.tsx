import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

// Maps markdown elements -> your existing Tailwind design language.
// react-markdown + remark-gfm handles the actual parsing (bold, italic,
// links, tables, nested lists, blockquotes, hr, arbitrary-length ordered
// lists, etc.) so this file only owns presentation, not parsing logic.
const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-black text-slate-900 mt-10 mb-5 tracking-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-extrabold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2 tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3 tracking-tight flex items-center">
      <span className="w-1.5 h-4 bg-blue-600 rounded mr-2.5 inline-block shrink-0" />
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider font-mono mt-4 mb-2">{children}</h4>
  ),
  p: ({ children }) => <p className="text-slate-600 text-sm leading-relaxed my-3 font-normal">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
  em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 font-medium underline decoration-blue-300 underline-offset-2 hover:text-blue-700"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="space-y-2 my-2 ml-4">{children}</ul>,
  ol: ({ children }) => <ol className="space-y-2.5 my-2 ml-4 list-decimal marker:text-blue-600 marker:font-mono marker:font-bold marker:text-xs pl-1">{children}</ol>,
  li: ({ children, className }) => {
    // GFM task list items get a `task-list-item` class from remark-gfm.
    const isTaskItem = className?.includes('task-list-item');
    if (isTaskItem) {
      return <li className="flex items-start space-x-2 text-slate-600 text-sm leading-relaxed list-none -ml-4">{children}</li>;
    }
    return (
      <li className="text-slate-600 text-sm leading-relaxed pl-1 marker:text-blue-500 marker:font-bold">
        {children}
      </li>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-200 bg-blue-50/40 pl-4 pr-3 py-2 my-4 rounded-r-lg text-slate-600 text-sm italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-t border-slate-200" />,
  code: ({ className, children, ...props }) => {
    const isBlock = /language-(\w+)/.test(className || '');
    if (!isBlock) {
      // Inline `code`
      return (
        <code className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-blue-600 rounded font-mono text-xs mx-0.5">
          {children}
        </code>
      );
    }
    // Fenced code block content, rendered by the `pre` override below.
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <div className="relative my-4 group">
      <span className="absolute top-2 right-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider select-none">
        Source Code
      </span>
      <pre className="bg-slate-50 text-blue-700 p-4 rounded-xl border border-slate-200 font-mono text-xs overflow-x-auto leading-relaxed shadow-sm">
        {children}
      </pre>
    </div>
  ),
  table: ({ children }) => (
    <div className="my-5 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="text-left text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold px-4 py-2.5 border-b border-slate-200">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="text-slate-600 text-sm px-4 py-2.5 align-top">{children}</td>,
  img: ({ src, alt }) => (
    <img src={src} alt={alt} className="rounded-xl border border-slate-200 my-4 max-w-full shadow-sm" />
  ),
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className="space-y-1">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}