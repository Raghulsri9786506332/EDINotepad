import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Custom renderer for color-coding headers and segment codes
const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      children={content}
      remarkPlugins={[remarkGfm]}
      components={{
        h3: ({node, ...props}) => <h3 className="text-lg font-bold text-blue-700 mt-4 mb-2" {...props} />,
        h4: ({node, ...props}) => <h4 className="text-base font-bold text-green-700 mt-3 mb-2 flex items-center gap-1" {...props} />,
        th: ({node, ...props}) => <th className="px-2 py-1 font-semibold text-blue-700 bg-muted" {...props} />,
        td: ({node, ...props}) => <td className="px-2 py-1 font-mono text-green-800" {...props} />,
        code: ({node, ...props}) => <code className="bg-gray-100 rounded px-1 text-pink-700 font-mono text-xs" {...props} />,
        strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
        li: ({node, ...props}) => <li className="mb-1" {...props} />
      }}
    />
  );
};

export default MarkdownRenderer;
