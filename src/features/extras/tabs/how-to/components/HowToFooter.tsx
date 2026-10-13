interface HowToFooterProps {
  t: (key: string) => string;
}

export const HowToFooter = ({ t }: HowToFooterProps) => {
  return (
    <div className="border-border/50 mt-12 border-t pt-10 text-center">
      <p className="text-muted-foreground mx-auto max-w-lg text-sm leading-relaxed italic">
        {t('extras.howto.footer.message')}
      </p>
    </div>
  );
};
