import type { ThemeId } from '@/components/preview/themeIds';
import { serializeToTypst as elegantSerialize } from '@/components/preview/themes/oneColumn/elegant/ElegantSerializer';
import { serializeToTypst as javascriptSerialize } from '@/components/preview/themes/oneColumn/javascript/JavaScriptSerializer';
import { serializeToTypst as plain2Serialize } from '@/components/preview/themes/oneColumn/plain2/Plain2Serializer';
import { serializeToTypst as plainSerialize } from '@/components/preview/themes/oneColumn/plain/PlainSerializer';
import { serializeToTypst as stackOverflowSerialize } from '@/components/preview/themes/oneColumn/stackoverflow/StackOverflowSerializer';
import { serializeToTypst as timelessSerialize } from '@/components/preview/themes/oneColumn/timeless/TimelessSerializer';
import { serializeToTypst as foggySerialize } from '@/components/preview/themes/twoColumn/foggy/FoggySerializer';
import { serializeToTypst as lunarSerialize } from '@/components/preview/themes/twoColumn/lunar/LunarSerializer';
import { serializeToTypst as mistySerialize } from '@/components/preview/themes/twoColumn/misty/MistySerializer';
import { serializeToTypst as skylineSerialize } from '@/components/preview/themes/twoColumn/skyline/SkylineSerializer';
import { serializeToTypst as softSerialize } from '@/components/preview/themes/twoColumn/soft/SoftSerializer';
import { serializeToTypst as swissGridSerialize } from '@/components/preview/themes/twoColumn/swiss-grid/SwissGridSerializer';
import type { ResumeData } from '@/types/resume';

/**
 * One Typst serializer per registered theme.
 *
 * Keyed to `ThemeId` rather than `string` so that a theme added to
 * `ThemeRegistry` without a serializer — which leaves it selectable and
 * previewable in HTML but with no PDF at all — is a compile error here instead
 * of a silent gap. `__tests__/typstCompile.test.ts` asserts the same property
 * at runtime, since that is what keeps its table from shrinking unnoticed.
 */
export const SERIALIZERS: Record<ThemeId, (resume: ResumeData) => string> = {
  elegant: elegantSerialize,
  plain: plainSerialize,
  plain2: plain2Serialize,
  misty: mistySerialize,
  foggy: foggySerialize,
  swiss_grid: swissGridSerialize,
  lunar: lunarSerialize,
  skyline: skylineSerialize,
  soft: softSerialize,
  javascript: javascriptSerialize,
  stackoverflow: stackOverflowSerialize,
  timeless: timelessSerialize,
};
