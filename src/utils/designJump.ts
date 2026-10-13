// Shared contract for the "jump into the Design tab" nav badges. A badge writes
// the target group + focus element into the URL; DesignTab consumes them to open
// that group (a collapsed disclosure has no layout box, so it must open *before*
// the scroll) and reveal the element, then clears the params so it fires once.
export type DesignGroupId = 'template' | 'layout' | 'typography' | 'details';

export const DESIGN_SECTION_PARAM = 'designSection';
export const DESIGN_FOCUS_PARAM = 'designFocus';

/** Point the URL at a Design-tab group and the element to reveal inside it. */
export function applyDesignJump(
  params: URLSearchParams,
  group: DesignGroupId,
  focusId: string,
): void {
  params.set('tab', 'design');
  params.set(DESIGN_SECTION_PARAM, group);
  params.set(DESIGN_FOCUS_PARAM, focusId);
}
