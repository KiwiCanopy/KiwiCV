interface HeaderWithFirstEntryOptions {
  header: string;
  entries: string[];
  trailing?: string;
}

interface HeaderWithFirstGridRowOptions {
  header: string;
  cards: string[];
  columns: string;
  firstRowCount: number;
  columnGutter?: string;
  rowGutter?: string;
  remainingPrefix?: string;
  trailing?: string;
}

function renderGrid({
  cards,
  columns,
  columnGutter,
  rowGutter,
}: Pick<HeaderWithFirstGridRowOptions, 'cards' | 'columns' | 'columnGutter' | 'rowGutter'>) {
  const gutterLines = [
    columnGutter ? `    column-gutter: ${columnGutter},` : '',
    rowGutter ? `    row-gutter: ${rowGutter},` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `#grid(
    columns: ${columns},
${gutterLines ? `${gutterLines}\n` : ''}    ${cards.join(',\n    ')}
  )`;
}

export function keepTypstHeaderWithFirstEntry({
  header,
  entries,
  trailing = '',
}: HeaderWithFirstEntryOptions): string {
  const [firstEntry, ...remainingEntries] = entries;
  if (!firstEntry) return '';

  return `\n#block(width: 100%, breakable: false)[
  ${header}
  ${firstEntry}
]
${remainingEntries.join('')}${trailing}`;
}

export function keepTypstHeaderWithFirstGridRow({
  header,
  cards,
  columns,
  firstRowCount,
  columnGutter,
  rowGutter,
  remainingPrefix = '',
  trailing = '',
}: HeaderWithFirstGridRowOptions): string {
  const firstRowCards = cards.slice(0, firstRowCount);
  const remainingCards = cards.slice(firstRowCount);
  if (firstRowCards.length === 0) return '';

  const firstGrid = renderGrid({ cards: firstRowCards, columns, columnGutter, rowGutter });
  const remainingGrid =
    remainingCards.length > 0
      ? `${remainingPrefix}${renderGrid({ cards: remainingCards, columns, columnGutter, rowGutter })}\n`
      : '';

  return `\n#block(width: 100%, breakable: false)[
  ${header}
  ${firstGrid}
]
${remainingGrid}${trailing}`;
}
