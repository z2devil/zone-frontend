export type MermaidViewMode = 'diagram' | 'source' | 'summary';

export function getMermaidViewMode({
  readOnly,
  summary,
}: {
  readOnly: boolean;
  summary: boolean;
}): MermaidViewMode {
  if (!readOnly) return 'source';
  return summary ? 'summary' : 'diagram';
}
