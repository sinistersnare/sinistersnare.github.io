import React from 'react';
import type { TocEntry } from '../types/pdf';

export interface GrowableOutlineListProps {
  items: TocEntry[];
  onChange: (items: TocEntry[]) => void;
}

export const GrowableOutlineList: React.FC<GrowableOutlineListProps> = ({ items, onChange }) => {
  // Always render a trailing empty row
  const rows: (TocEntry & { __empty__?: boolean })[] = React.useMemo(() => {
    return [...items, { title: '', text_snippet: '', level: 1, page: undefined, __empty__: true }];
  }, [items]);

  const updateRow = (index: number, patch: Partial<TocEntry>) => {
    const isTrailingEmpty = index === rows.length - 1;
    const base = isTrailingEmpty
      ? { title: '', text_snippet: '', level: 1, page: undefined }
      : items[index];
    const nextRow: TocEntry = {
      level: base.level ?? 1,
      title: patch.title !== undefined ? patch.title : base.title,
      text_snippet: patch.text_snippet !== undefined ? patch.text_snippet : base.text_snippet,
      page: patch.page !== undefined ? patch.page : base.page,
      children: undefined,
    };

    // If editing the trailing empty and any field is non-empty, append it
    const hasContent = (nextRow.title || '').trim().length > 0 || typeof nextRow.page === 'number';
    if (isTrailingEmpty) {
      if (!hasContent) return; // keep it empty
      onChange([...items, nextRow]);
    } else {
      const clone = items.slice();
      clone[index] = nextRow;
      onChange(clone);
    }
  };

  const removeRow = (index: number) => {
    const clone = items.slice();
    clone.splice(index, 1);
    onChange(clone);
  };

  return (
    <ol style={{ listStyle: 'decimal', paddingLeft: '1.25rem', margin: 0 }}>
      {rows.map((row, idx) => (
        <li key={idx} className="flex-column" style={{ marginBottom: '0.5rem' }}>
          <GrowableRow
            index={idx}
            value={row}
            isEmpty={!!row.__empty__}
            onChange={updateRow}
            onRemove={removeRow}
          />
        </li>
      ))}
    </ol>
  );
};

const GrowableRow: React.FC<{
  index: number;
  value: TocEntry & { __empty__?: boolean };
  isEmpty: boolean;
  onChange: (index: number, patch: Partial<TocEntry>) => void;
  onRemove: (index: number) => void;
}> = ({ index, value, isEmpty, onChange, onRemove }) => {
  // Controlled inputs for title and page
  const title = value.title ?? '';
  const pageStr = value.page !== undefined && value.page !== null ? String(value.page) : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label className="label" htmlFor={`title-${index}`}>
            Title
          </label>
          <input
            id={`title-${index}`}
            className="input"
            type="text"
            placeholder={isEmpty ? 'Add a heading…' : 'Heading title'}
            value={title}
            onChange={(e) => onChange(index, { title: e.target.value })}
          />
        </div>
        <div style={{ width: 120 }}>
          <label className="label" htmlFor={`page-${index}`}>
            Page
          </label>
          <input
            id={`page-${index}`}
            className="input"
            type="number"
            min={1}
            placeholder="e.g., 3"
            value={pageStr}
            onChange={(e) => {
              const v = e.target.value;
              const n = v === '' ? undefined : Math.max(1, parseInt(v, 10) || 1);
              onChange(index, { page: n });
            }}
          />
        </div>
        <div style={{ width: '48px' }}>
          <label className="label" htmlFor={`remove-${index}`}>
            {'\u00A0'}
          </label>
          {!isEmpty && (
            <button
              id={`remove-${index}`}
              type="button"
              className="btn-file"
              aria-label="Remove outline item"
              style={{ width: '100%' }}
              onClick={() => onRemove(index)}
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
