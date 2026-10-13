import React, { Fragment } from 'react';

import { cn } from '@/utils/cn';

interface FormattedTextProps {
  content: string;
  className?: string;
}

/**
 * A component that renders simple formatted text (bolding, paragraphs, bullet points)
 * used primarily for legal and privacy pages.
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ content, className }) => {
  if (!content) return null;

  // Split into paragraphs by double newlines
  const paragraphs = content.split('\n\n');

  return (
    <div className={cn('space-y-4', className)}>
      {paragraphs.map((para, paraIndex) => {
        // Check if paragraph is a list
        const lines = para.split('\n');
        const isList = lines.every(
          (line) => line.trim().startsWith('- ') || line.trim().startsWith('* '),
        );

        if (isList) {
          return (
            <ul key={paraIndex} className="list-outside list-disc space-y-2 pl-5">
              {lines.map((line, lineIndex) => {
                const cleanLine = line.trim().replace(/^[-*]\s+/, '');
                return (
                  <li key={lineIndex} className="text-foreground/80 leading-relaxed">
                    {renderFormattedPart(cleanLine)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard paragraph
        return (
          <p
            key={paraIndex}
            className="text-foreground/80 leading-relaxed break-words whitespace-normal"
          >
            {renderLineWithBold(para)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Internal helper to render bold text and handle single line breaks
 */
function renderLineWithBold(text: string) {
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => (
    <Fragment key={lineIndex}>
      {renderFormattedPart(line)}
      {lineIndex < lines.length - 1 && <br />}
    </Fragment>
  ));
}

function renderFormattedPart(text: string) {
  // Matches [text](url), **bold**, or *italics*
  const parts = text.split(/(\[.*?\]\(.*?\))|(\*\*.*?\*\*)|(\*.*?\*)/g);

  return parts.map((part, i) => {
    if (!part) return null;

    // Handle markdown links: [text](url)
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [, linkText, url] = linkMatch;
        return (
          <a
            key={i}
            href={url}
            target={url.startsWith('http') ? '_blank' : undefined}
            rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="text-primary-strong font-medium hover:underline"
          >
            {linkText}
          </a>
        );
      }
    }

    // Handle bold: **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-foreground font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Handle italics: *text*
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
}
