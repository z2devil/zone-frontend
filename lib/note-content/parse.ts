import { Descendant, Element, Node, Text } from 'slate';
import { BlockElementType } from '@/lib/constants';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeMermaidChildren = (value: unknown): unknown[] => {
  if (!Array.isArray(value) || value.length === 0) {
    return [
      {
        type: BlockElementType.CODE_LINE_BLOCK,
        children: [{ text: '' }],
      },
    ];
  }

  return value.map(child => {
    if (!isRecord(child)) {
      return {
        type: BlockElementType.CODE_LINE_BLOCK,
        children: [{ text: '' }],
      };
    }

    if (Array.isArray(child.children)) {
      return {
        ...child,
        type: BlockElementType.CODE_LINE_BLOCK,
      };
    }

    return {
      type: BlockElementType.CODE_LINE_BLOCK,
      children: [child],
    };
  });
};

const normalizeNode = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalizeNode);
  if (!isRecord(value)) return value;

  const normalized = Array.isArray(value.children)
    ? { ...value, children: value.children.map(normalizeNode) }
    : value;

  if (
    normalized.type === BlockElementType.CODE_BLOCK &&
    typeof normalized.language === 'string' &&
    normalized.language.trim().toLowerCase() === 'mermaid'
  ) {
    const rest = { ...normalized };
    delete rest.language;
    return {
      ...rest,
      type: BlockElementType.MERMAID,
      children: normalizeMermaidChildren(normalized.children),
    };
  }

  if (normalized.type === BlockElementType.MERMAID) {
    return {
      ...normalized,
      children: normalizeMermaidChildren(normalized.children),
    };
  }

  return normalized;
};

export const normalizeNoteContent = (value: unknown): Descendant[] | null => {
  const normalized = normalizeNode(value);

  if (!Node.isNodeList(normalized) || normalized.length === 0) return null;
  if (!normalized.every(node => Element.isElement(node) || Text.isText(node))) {
    return null;
  }

  return normalized;
};

export const parseNoteContent = (content: string): Descendant[] | null => {
  try {
    return normalizeNoteContent(JSON.parse(content));
  } catch {
    return null;
  }
};
