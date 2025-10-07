import React from "react";

interface HighlightProps {
  text: string;
  highlight: string;
}

export function Highlight({ text, highlight }: HighlightProps) {
  if (!highlight) return <>{text}</>;
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} style={{ backgroundColor: '#bbf7d0', color: 'inherit', borderRadius: '0.25rem', padding: '0 2px' }}>{part}</mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}
