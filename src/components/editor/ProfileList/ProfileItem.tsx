import { useEffect, useId, useState } from 'react';

import { ItemOrderControls } from '@/components/editor/ItemOrderControls';
import { NETWORK_URLS, SUGGESTED_NETWORKS } from '@/components/editor/ProfileList/constants';
import { type ProfileItemProps } from '@/components/editor/ProfileList/types';
import { getIcon } from '@/components/editor/ProfileList/utils';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { PROFILES_LIST_ID } from '@/constants/focusAnchors';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { cn } from '@/utils/cn';
import { Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react';

export function ProfileItem({
  profile,
  index,
  isHidden,
  activeSuggestionIndex,
  setActiveSuggestionIndex,
  suggestionRef,
  updateProfile,
  handleToggleVisibility,
  removeProfile,
  t,
  tCV,
  dragHandleProps,
  setNodeRef,
  style,
  forceCollapsed = false,
  onNetworkLocalChange,
  localNetworkValue,
  moveProfile,
  total = 0,
}: ProfileItemProps) {
  const { isStandard, isSocial } = useEditorBreakpoints();
  const displayNetwork = localNetworkValue ?? profile.network;
  const listId = useId();
  const [highlighted, setHighlighted] = useState(-1);
  const options = SUGGESTED_NETWORKS.filter((n) =>
    n.toLowerCase().includes((displayNetwork || '').toLowerCase()),
  );
  // A custom network matches nothing: no empty popup to announce as expanded.
  const isOpen = activeSuggestionIndex === index && options.length > 0;

  // Focus stays in the field, so the list must bring the active option into view.
  useEffect(() => {
    if (isOpen && highlighted >= 0) {
      document.getElementById(`${listId}-${highlighted}`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlighted, listId]);

  const closeList = () => {
    setHighlighted(-1);
    setActiveSuggestionIndex?.(null);
  };

  /** Picks a network, keeping a URL that already belongs to it. */
  const selectNetwork = (newNetwork: string) => {
    const currentUrl = profile.url || '';
    const brandKeyword = newNetwork.toLowerCase().replace(/\s+/g, '');
    const isXOrTwitter = (n: string) => n.toLowerCase() === 'x' || n.toLowerCase() === 'twitter';
    const isXOrTwitterUrl =
      currentUrl.toLowerCase().includes('x.com') ||
      currentUrl.toLowerCase().includes('twitter.com');
    const urlMatchesBrand =
      currentUrl.toLowerCase().includes(brandKeyword) ||
      (isXOrTwitter(newNetwork) && isXOrTwitterUrl);
    const newUrl = currentUrl && urlMatchesBrand ? currentUrl : NETWORK_URLS[newNetwork] || '';

    onNetworkLocalChange?.(index, newNetwork);
    updateProfile?.(index, { network: newNetwork, url: newUrl });
    closeList();
  };
  const mergedStyle = {
    ...style,
    opacity:
      isHidden && (style?.opacity === 1 || style?.opacity === undefined) ? 0.4 : style?.opacity,
  };

  return (
    <div
      ref={setNodeRef}
      style={mergedStyle}
      className={cn(
        'group flex w-full min-w-0 items-center gap-3 border p-3 transition-colors duration-200',
        'bg-card',
        isStandard ? 'border-border rounded-lg' : 'border-border/60 rounded-xl',
        !forceCollapsed && 'hover:bg-muted/20',
        forceCollapsed &&
          'border-primary-strong bg-card/95 cursor-grabbing shadow-[var(--elevation-2)] backdrop-blur-sm',
      )}
    >
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          isStandard ? 'flex-row items-center' : 'flex-col',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {dragHandleProps && (
            <IconButton
              label={t('common.move_named', { name: profile.network || t('common.untitled') })}
              variant="quiet"
              className={forceCollapsed ? 'cursor-grabbing' : 'cursor-move'}
              style={{ touchAction: 'none' }}
              {...dragHandleProps}
            >
              <GripVertical className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          )}

          <div className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            {getIcon(profile.network)}
          </div>

          {!forceCollapsed ? (
            <div
              // Read by `firstEntryFieldAnchor`.
              data-entry-fields={PROFILES_LIST_ID}
              className={cn(
                'grid flex-1 items-center gap-3',
                isSocial ? 'grid-cols-12' : isStandard ? 'grid-cols-2' : 'grid-cols-1',
              )}
            >
              <div className={cn('relative', isSocial ? 'col-span-3' : 'col-span-1')}>
                {/* The ARIA combobox pattern: the list opens on typing, a
                    click or ArrowDown — never on focus — and its options are
                    not tab stops, so Tab leaves the field for Username. */}
                <Input
                  role="combobox"
                  aria-label={t('editor.fields.network')}
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? listId : undefined}
                  aria-autocomplete="list"
                  aria-activedescendant={
                    isOpen && highlighted >= 0 ? `${listId}-${highlighted}` : undefined
                  }
                  placeholder={tCV('placeholders.basics.network')}
                  value={profile.network}
                  onChange={(e) => {
                    onNetworkLocalChange?.(index, e.target.value);
                    updateProfile?.(index, { network: e.target.value });
                    setHighlighted(-1);
                    setActiveSuggestionIndex?.(index);
                  }}
                  onClick={() => {
                    onNetworkLocalChange?.(index, profile.network);
                    setActiveSuggestionIndex?.(index);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      if (!isOpen) {
                        onNetworkLocalChange?.(index, profile.network);
                        setActiveSuggestionIndex?.(index);
                        setHighlighted(e.key === 'ArrowDown' ? 0 : options.length - 1);
                        return;
                      }
                      if (options.length === 0) return;
                      const step = e.key === 'ArrowDown' ? 1 : -1;
                      setHighlighted(
                        (current) => (current + step + options.length) % options.length,
                      );
                    } else if (
                      e.key === 'Enter' &&
                      isOpen &&
                      highlighted >= 0 &&
                      options[highlighted]
                    ) {
                      e.preventDefault();
                      selectNetwork(options[highlighted]);
                    } else if (e.key === 'Escape' && isOpen) {
                      e.preventDefault();
                      closeList();
                    } else if (e.key === 'Tab') {
                      closeList();
                    }
                  }}
                  onBlur={() => {
                    if (isOpen) closeList();
                  }}
                  onInput={(e) => {
                    onNetworkLocalChange?.(index, (e.target as HTMLInputElement).value);
                  }}
                  className="h-9 text-sm"
                />
                {isOpen && (
                  <div
                    ref={suggestionRef}
                    id={listId}
                    role="listbox"
                    aria-label={t('editor.fields.network')}
                    className="bg-popover border-border absolute top-full right-0 left-0 z-[100] mt-1 max-h-48 min-w-[124px] overflow-y-auto rounded-md border py-1 shadow-lg"
                  >
                    {options.map((network, optionIndex) => (
                      <div
                        key={network}
                        id={`${listId}-${optionIndex}`}
                        role="option"
                        aria-selected={optionIndex === highlighted}
                        // Keeps focus in the field, so the list never steals it.
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectNetwork(network)}
                        className={cn(
                          'hover:bg-muted text-foreground flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors',
                          // A ring, not only a fill: bg-muted on the popover is ~1.2:1 (1.4.11).
                          optionIndex === highlighted &&
                            'bg-muted ring-primary-strong ring-2 ring-inset',
                        )}
                      >
                        {getIcon(network)}
                        <span className="min-w-0 flex-1 truncate text-left">{network}</span>
                      </div>
                    ))}
                  </div>
                )}
                <span role="status" className="sr-only">
                  {isOpen ? t('editor.basics.profiles.suggestions', { count: options.length }) : ''}
                </span>
              </div>
              <Input
                aria-label={tCV('placeholders.basics.username')}
                placeholder={tCV('placeholders.basics.username')}
                value={profile.username}
                onChange={(e) => updateProfile?.(index, { username: e.target.value })}
                className="h-9 text-sm"
                containerClassName={cn(isSocial ? 'col-span-3' : 'col-span-1')}
              />
              <Input
                aria-label={tCV('placeholders.common.https')}
                placeholder={tCV('placeholders.common.https')}
                value={profile.url}
                onChange={(e) => updateProfile?.(index, { url: e.target.value })}
                className="h-9 text-sm"
                containerClassName={cn(
                  isSocial ? 'col-span-6' : isStandard ? 'col-span-2' : 'col-span-1',
                )}
              />
            </div>
          ) : (
            <div className="w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">
                {profile.network || t('common.untitled')}
              </p>
              {profile.username && (
                <p className="text-muted-foreground truncate text-xs">{profile.username}</p>
              )}
            </div>
          )}
        </div>

        {!forceCollapsed && (
          <div
            className={cn(
              'mt-2 flex flex-row flex-wrap items-center justify-end gap-1',
              isStandard ? 'border-border mt-0 ml-4 border-l pl-2' : 'mt-2',
            )}
          >
            {moveProfile && total > 0 && (
              <ItemOrderControls
                itemLabel={profile.network || t('common.untitled')}
                position={index + 1}
                total={total}
                onMoveUp={() => moveProfile(index, -1)}
                onMoveDown={() => moveProfile(index, 1)}
              />
            )}
            <IconButton
              label={
                isHidden
                  ? t('common.show_named', { name: profile.network || t('common.untitled') })
                  : t('common.hide_named', { name: profile.network || t('common.untitled') })
              }
              onClick={() => handleToggleVisibility?.(profile)}
              variant="quiet"
            >
              {isHidden ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </IconButton>
            <IconButton
              label={t('common.remove_named', { name: profile.network || t('common.untitled') })}
              // See `Accordion`: read positionally by `entryDeleteAnchor`.
              data-entry-delete={PROFILES_LIST_ID}
              onClick={() => removeProfile?.(index)}
              variant="quiet"
              className="hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
}
