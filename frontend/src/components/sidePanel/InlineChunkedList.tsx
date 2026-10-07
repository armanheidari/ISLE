import React from 'react';

interface InlineChunkedListProps<T> {
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  chunkSize?: number;
  className?: string;
  moreClassName?: string;
}

export function InlineChunkedList<T>({
  items,
  renderItem,
  chunkSize = 20,
  className = '',
  moreClassName = 'text-xs text-gray-500 cursor-pointer',
}: InlineChunkedListProps<T>) {
  const [chunksShown, setChunksShown] = React.useState<number>(1);

  if (!items || items.length === 0) return null;

  const total = items.length;
  const shownCount = Math.min(chunksShown * chunkSize, total);
  const remaining = total - shownCount;

  return (
    <div className={className}>
      {items.slice(0, shownCount).map((item, index) => (
        <React.Fragment key={index}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}

      {remaining > 0 && (
        <div className="mt-1">
          <button
            type="button"
            aria-label={`Show ${Math.min(chunkSize, remaining)} more`}
            className={moreClassName}
            onClick={() => setChunksShown((current) => current + 1)}
          >
            +{remaining} more
          </button>
        </div>
      )}
    </div>
  );
}
