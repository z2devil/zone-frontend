import { useReadOnly } from 'slate-react';

const InlineChromiumBugfix = () => {
  const readOnly = useReadOnly();

  if (readOnly) return null;

  return (
    <span
      contentEditable={false}
      style={{
        display: 'inline-block',
        width: '0',
        height: '0',
        overflow: 'hidden',
        verticalAlign: 'bottom',
      }}>
      {String.fromCodePoint(160) /* Non-breaking space */}
    </span>
  );
};

export default InlineChromiumBugfix;
