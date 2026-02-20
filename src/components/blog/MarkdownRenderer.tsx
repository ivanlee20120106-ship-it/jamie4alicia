import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

const MarkdownRenderer = ({ content }: Props) => (
  <div className="prose prose-invert max-w-none
    prose-headings:font-display prose-headings:text-foreground
    prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
    prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border/30 prose-h2:pb-2
    prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2
    prose-p:text-muted-foreground prose-p:leading-7
    prose-a:text-primary prose-a:underline prose-a:underline-offset-4
    prose-strong:text-foreground
    prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
    prose-pre:bg-muted prose-pre:border prose-pre:border-border/30 prose-pre:rounded-lg
    prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
    prose-ul:text-muted-foreground prose-ol:text-muted-foreground
    prose-li:text-muted-foreground
    prose-img:rounded-lg
    prose-hr:border-border/30
  ">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  </div>
);

export default MarkdownRenderer;
