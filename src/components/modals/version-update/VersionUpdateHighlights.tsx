import type { Highlight } from '@/components/modals/version-update/types';
import { InfoCard } from '@/components/ui/InfoCard';
import { getHighlightStyle } from '@/data/changelogHighlights';
import { useTranslation } from '@/hooks/useTranslation';
import { MoreHorizontal } from 'lucide-react';

const MAX_CARDS = 6;

interface VersionUpdateHighlightsProps {
  highlights: Highlight[];
  onFullChangelog: () => void;
}

/** Three-column grid of highlight cards, with tooltips. */
export function VersionUpdateHighlights({
  highlights,
  onFullChangelog,
}: VersionUpdateHighlightsProps) {
  const { t } = useTranslation();

  const displayed = highlights.slice(0, MAX_CARDS);
  const hasMore = highlights.length > MAX_CARDS;

  return (
    <div className="relative z-10 mb-8 grid grid-cols-3 gap-2 min-[450px]:gap-3">
      {displayed.map((highlight, idx) => {
        // The last cell becomes an overflow affordance rather than a card, so
        // the grid never ends on a truncated set with no way to see the rest.
        const isLastInGrid = idx === MAX_CARDS - 1 && hasMore;

        if (isLastInGrid) {
          return (
            <InfoCard
              key="more-highlights"
              icon={MoreHorizontal}
              label="..."
              description={t('updates.more_highlights_desc')}
              color="neutral"
              className="opacity-80"
              tooltipAlignment="right"
              onClick={onFullChangelog}
            />
          );
        }

        const { icon: Icon, token } = getHighlightStyle(highlight.id);

        // Determine tooltip alignment based on position in grid (3 columns)
        const column = idx % 3;
        const tooltipAlignment = column === 0 ? 'left' : column === 2 ? 'right' : 'center';

        return (
          <InfoCard
            key={highlight.id}
            icon={Icon}
            label={highlight.badge}
            description={highlight.content}
            color={token}
            tooltipAlignment={tooltipAlignment}
          />
        );
      })}
    </div>
  );
}
