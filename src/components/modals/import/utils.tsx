// Helper for bold text rendering from **text** pattern
export const renderBoldText = (text: string) => {
  return text.split('**').map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-foreground font-bold">
        {part}
      </strong>
    ) : (
      part
    ),
  );
};
