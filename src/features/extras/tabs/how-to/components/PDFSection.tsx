interface PDFSectionProps {
  t: (key: string) => string;
}

export const PDFSection = ({ t }: PDFSectionProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-300">
      <div>
        <h2 className="text-foreground mb-4 text-3xl font-extrabold tracking-tight">
          {t('extras.howto.pdf_guide.title')}
        </h2>
        <p className="text-foreground/80 text-lg leading-relaxed">
          {t('extras.howto.pdf_guide.intro')}
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            title: t('extras.howto.pdf_guide.font_size'),
            desc: t('extras.howto.pdf_guide.font_size_desc'),
          },
          {
            title: t('extras.howto.pdf_guide.use_pagebreaks'),
            desc: t('extras.howto.pdf_guide.use_pagebreaks_desc'),
          },
          {
            title: t('extras.howto.pdf_guide.space_opt'),
            desc: t('extras.howto.pdf_guide.space_opt_desc'),
          },
          {
            title: t('extras.howto.pdf_guide.rearrange_sections'),
            desc: t('extras.howto.pdf_guide.rearrange_sections_desc'),
          },
        ].map((tip, i) => (
          <div key={i} className="bg-muted/30 border-border/50 flex gap-4 rounded-xl border p-6">
            <div className="bg-primary/10 text-primary-strong flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
              {i + 1}
            </div>
            <div>
              <h4 className="text-foreground mb-1 font-bold">{tip.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
