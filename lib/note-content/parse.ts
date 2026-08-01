import { Descendant, Element, Node, Text } from 'slate';

export const parseNoteContent = (content: string): Descendant[] | null => {
  try {
    const value: unknown = JSON.parse(content);
    if (!Node.isNodeList(value) || value.length === 0) return null;
    if (!value.every(node => Element.isElement(node) || Text.isText(node))) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
};
