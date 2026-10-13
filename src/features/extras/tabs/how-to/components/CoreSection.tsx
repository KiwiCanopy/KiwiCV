import { renderWithIcons } from '@/utils/text-rendering';
import {
  ArrowRightLeft,
  CornerDownLeft,
  EyeOff,
  FlipHorizontal,
  GripVertical,
  Sparkles,
} from 'lucide-react';

interface CoreSectionProps {
  t: (key: string) => string;
}

export const CoreSection = ({ t }: CoreSectionProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-300">
      <div>
        <h2 className="text-foreground mb-4 text-3xl font-extrabold tracking-tight">
          {t('extras.howto.core.title')}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {[
          {
            id: 'switch',
            title: t('extras.howto.core.switch_sides'),
            desc: t('extras.howto.core.switch_sides_desc'),
            icon: FlipHorizontal,
          },
          {
            id: 'move',
            title: t('common.move_items'),
            desc: t('extras.howto.core.move_items_desc'),
            icon: ArrowRightLeft,
          },
          {
            id: 'rearrange',
            title: t('extras.howto.core.rearrange'),
            desc: t('extras.howto.core.rearrange_desc'),
            icon: GripVertical,
          },
          {
            id: 'hide',
            title: t('extras.howto.core.hide_show'),
            desc: t('extras.howto.core.hide_show_desc'),
            icon: EyeOff,
          },
          {
            id: 'breaks',
            title: t('extras.howto.core.page_breaks'),
            desc: t('extras.howto.core.page_breaks_desc'),
            icon: CornerDownLeft,
          },
          {
            id: 'ai',
            title: t('extras.howto.core.ai_assistant'),
            desc: t('extras.howto.core.ai_assistant_desc'),
            icon: Sparkles,
          },
        ].map((item) => (
          <div
            key={item.id}
            className="bg-muted/30 border-border/50 hover:bg-muted/50 rounded-xl border p-5 transition-colors"
          >
            <div className="bg-primary/10 text-primary-strong mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="text-foreground mb-2 font-extrabold">{item.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {renderWithIcons(item.desc)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
