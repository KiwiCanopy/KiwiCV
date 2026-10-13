/**
 * Renders text with markdown-style links [text](url) and bold **text**
 */
export const renderWithLinks = (text: string) => {
  // Regex for both markdown links [text](url) and bold text **text**
  const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    // Handle Link
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-strong font-bold hover:underline"
        >
          {linkMatch[1]}
        </a>
      );
    }
    // Handle Bold
    const boldMatch = part.match(/\*\*(.*?)\*\*/);
    if (boldMatch) {
      return (
        <strong key={i} className="text-foreground font-bold">
          {boldMatch[1]}
        </strong>
      );
    }
    return part;
  });
};
