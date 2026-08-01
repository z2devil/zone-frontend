import { useCallback } from 'react';
import { BaseRange, Editor, Element, Node, NodeEntry } from 'slate';
import { CodeBlockElement } from 'types/slate';
import { normalizeTokens } from '../utils/normalizeTokens';
import { BlockElementType } from '@/lib/constants';
import { tokenizeCode } from '../utils/tokenizeCode';

export const useDecorate = (editor: Editor) => {
  const blockEntries: NodeEntry<CodeBlockElement>[] = Array.from(
    Editor.nodes(editor, {
      at: [],
      mode: 'highest',
      match: n =>
        Element.isElement(n) && n.type === BlockElementType.CODE_BLOCK,
    })
  );

  const nodeToDecorations = mergeMaps(
    ...blockEntries.map(getChildNodeToDecorations)
  );

  // console.log('[ blockEntries ]', blockEntries);

  editor.nodeToDecorations = nodeToDecorations;

  return useCallback(
    ([node, path]: NodeEntry) => {
      if (Element.isElement(node)) {
        const ranges = editor.nodeToDecorations?.get(node) || [];
        return ranges;
      }

      return [];
    },
    [editor.nodeToDecorations]
  );
};

const mergeMaps = <K, V>(...maps: Map<K, V>[]) => {
  const map = new Map<K, V>();

  for (const m of maps) {
    for (const item of m) {
      map.set(...item);
    }
  }

  // console.log('[ mergeMaps ]', map);

  return map;
};

const getChildNodeToDecorations = ([
  block,
  blockPath,
]: NodeEntry<CodeBlockElement>) => {
  const nodeToDecorations = new Map<
    Element,
    (BaseRange & { [key: string]: unknown })[]
  >();

  const text = block.children.map(line => Node.string(line)).join('\n');
  const language = block.language || 'plaintext';
  const tokens = tokenizeCode(text, language);
  const normalizedTokens = normalizeTokens(tokens);
  const blockChildren = block.children as Element[];

  for (let index = 0; index < normalizedTokens.length; index++) {
    const tokens = normalizedTokens[index];
    const element = blockChildren[index];

    if (!nodeToDecorations.has(element)) {
      nodeToDecorations.set(element, []);
    }

    let start = 0;
    for (const token of tokens) {
      const length = token.content.length;
      if (!length) {
        continue;
      }

      const end = start + length;

      const path = [...blockPath, index, 0];
      const range = {
        anchor: { path, offset: start },
        focus: { path, offset: end },
        token: true,
        ...Object.fromEntries(token.types.map(type => [type, true])),
      };

      nodeToDecorations.get(element)?.push(range);

      start = end;
    }
  }

  return nodeToDecorations;
};
