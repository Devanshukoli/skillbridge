import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeLines: string[] = [];
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-wrapper-${i}`} className="relative my-4 group">
            <span className="absolute top-2 right-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider select-none">
              Source Code
            </span>
            <pre className="bg-slate-50 text-blue-700 p-4 rounded-xl border border-slate-200 font-mono text-xs overflow-x-auto leading-relaxed shadow-sm">
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    // Check Headers
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg font-bold text-slate-900 mt-6 mb-3 tracking-tight flex items-center">
          <span className="w-1.5 h-4 bg-blue-600 rounded mr-2.5 inline-block" />
          {trimmed.substring(4)}
        </h3>
      );
    } else if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-bold text-blue-600 uppercase tracking-wider font-mono mt-4 mb-2">
          {trimmed.substring(5)}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl font-extrabold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2 tracking-tight">
          {trimmed.substring(3)}
        </h2>
      );
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl font-black text-slate-900 mt-10 mb-5 tracking-tight">
          {trimmed.substring(2)}
        </h1>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={`li-div-${i}`} className="flex items-start space-x-2 my-2 ml-4">
          <span className="text-blue-500 font-bold select-none">•</span>
          <p className="text-slate-600 text-sm leading-relaxed flex-1">
            {trimmed.substring(2)}
          </p>
        </div>
      );
    } else if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ') || trimmed.startsWith('4. ')) {
      const parts = trimmed.split('. ');
      const num = parts[0];
      const text = parts.slice(1).join('. ');
      elements.push(
        <div key={`ol-div-${i}`} className="flex items-start space-x-2 my-2.5 ml-4">
          <span className="font-mono text-blue-600 text-xs font-bold w-4 mt-0.5">{num}.</span>
          <p className="text-slate-600 text-sm leading-relaxed flex-1">
            {text}
          </p>
        </div>
      );
    } else if (trimmed === '') {
      elements.push(<div key={`blank-${i}`} className="h-2" />);
    } else {
      // Inline formatting replacements for basic things like `code`
      // Standard text element
      const formattedText = parseInlineFormatting(trimmed);
      elements.push(
        <p key={`p-${i}`} className="text-slate-600 text-sm leading-relaxed my-3 font-normal">
          {formattedText}
        </p>
      );
    }
  }

  return <div className="space-y-1">{elements}</div>;
}

// Support basic `code` elements formatting
function parseInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-blue-600 rounded font-mono text-xs mx-0.5">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
