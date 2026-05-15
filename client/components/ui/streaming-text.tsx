'use client'

import useStreamText from "@/hooks/use-stream-text";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

interface StreamingTextProps {
    text: string;
}

const StreamingText: React.FC<StreamingTextProps> = ({text}) => {
    const streamedText = useStreamText(text, 30);

     return (
      <div className="inline-block">
        <ReactMarkdown
          rehypePlugins={[rehypeSanitize]}
          remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        >
          {streamedText}
        </ReactMarkdown>
      </div>
  );
}

export default StreamingText;