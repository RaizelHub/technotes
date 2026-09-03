import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import CodeBlock from '@tiptap/extension-code-block';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Copy, Check } from 'lucide-react';

export const CiscoCodeBlockView: React.FC<any> = ({ node }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = node.textContent;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <NodeViewWrapper className="relative my-4 group">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-zinc-800/80 border-t border-l border-r border-gray-200 dark:border-zinc-700 rounded-t-md text-xs font-mono text-gray-600 dark:text-zinc-400 select-none">
        <span className="font-semibold text-gray-700 dark:text-zinc-200 tracking-tight">CISCO CLI / COMMANDS</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors border border-transparent hover:border-gray-300 dark:hover:border-zinc-600"
          title="Copy commands"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.5]" />
              <span className="font-medium text-black dark:text-white">Copied ✓</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="!mt-0 !rounded-t-none bg-gray-50/70 dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-700 p-3.5 font-mono text-xs md:text-sm leading-relaxed text-gray-900 dark:text-zinc-100 overflow-x-auto whitespace-pre">
        <NodeViewContent as="code" className="font-mono" />
      </pre>
    </NodeViewWrapper>
  );
};

export const CustomCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CiscoCodeBlockView);
  },
});
