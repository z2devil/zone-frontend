import { RichEditor } from "types/slate";
import { editorUtils } from "../../utils";
import { BlockElementType, InlineElementType, MarkType } from "../../constants";
import { Element, Transforms } from "slate";
import { MouseEvent } from "react";

export type ToolbarOption = {
  title: string;
  icon: string;
  active?: boolean | ((editor: RichEditor) => boolean);
  disabled?: boolean | ((editor: RichEditor) => boolean);
  onClick: (e: MouseEvent, editor: RichEditor) => void;
} | 'separator';

const options: ToolbarOption[] = [
  {
    title: '标题',
    icon: 'icon-head',
    active: (editor) => {
      return (
        editorUtils.isElementActive(editor, BlockElementType.HEADING_1) ||
        editorUtils.isElementActive(editor, BlockElementType.HEADING_2) ||
        editorUtils.isElementActive(editor, BlockElementType.HEADING_3) ||
        editorUtils.isElementActive(editor, BlockElementType.HEADING_4) ||
        editorUtils.isElementActive(editor, BlockElementType.HEADING_5) ||
        editorUtils.isElementActive(editor, BlockElementType.HEADING_6)
      );
    },
    disabled: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK);
    },
    onClick: (e, editor) => {
      e.preventDefault();
      editorUtils.insertBlockNode(editor, BlockElementType.HEADING_1);
    },
  },
  {
    title: '代码块',
    icon: 'icon-code',
    active: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK);
    },
    disabled: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK);
    },
    onClick: (e, editor) => {
      e.preventDefault();
      if (editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK)) {
        return;
      }
      Transforms.wrapNodes(
        editor,
        { type: BlockElementType.CODE_BLOCK, children: [] },
        {
          match: n =>
            Element.isElement(n) && n.type === BlockElementType.PARAGRAPH,
          split: true,
        }
      );
    },
  },
  {
    title: '图片',
    icon: 'icon-picture',
    active: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.IMAGE);
    },
    disabled: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK);
    },
    onClick: (e, editor) => {
      e.preventDefault();
      editorUtils.insertBlockNode(editor, BlockElementType.IMAGE);
    },
  },
  {
    title: '视频',
    icon: 'icon-film',
    active: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.VIDEO);
    },
    disabled: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK);
    },
    onClick: (e, editor) => {
      e.preventDefault();
      editorUtils.insertBlockNode(editor, BlockElementType.VIDEO);
    }
  },
  {
    title: '音乐',
    icon: 'icon-music',
    active: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.MUSIC);
    },
    disabled: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK);
    },
    onClick: (e, editor) => {
      e.preventDefault();
      editorUtils.insertBlockNode(editor, BlockElementType.MUSIC);
    }
  },
  {
    title: '画板',
    icon: 'icon-white-board',
    active: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.MUSIC);
    },
    disabled: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK);
    },
    onClick: (e, editor) => {
      e.preventDefault();
      editorUtils.insertBlockNode(editor, BlockElementType.MUSIC);
    }
  },
  {
    title: 'spline',
    icon: 'icon-cube',
    active: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CUBE);
    },
    disabled: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK);
    },
    onClick: (e, editor) => {
      e.preventDefault();
      editorUtils.insertBlockNode(editor, BlockElementType.CUBE);
    }
  },
  'separator',
  {
    title: '加粗',
    icon: 'icon-bold',
    active: (editor) => {
      return editorUtils.isMarkActive(editor, MarkType.BOLD);
    },
    disabled: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK);
    },
    onClick: (e, editor) => {
      e.preventDefault();
      editorUtils.toggleMark(editor, MarkType.BOLD);
    }
  },
  {
    title: '斜体',
    icon: 'icon-italic',
    active: (editor) => {
      return editorUtils.isMarkActive(editor, MarkType.ITALIC);
    },
    disabled: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK);
    },
    onClick: (e, editor) => {
      e.preventDefault();
      editorUtils.toggleMark(editor, MarkType.ITALIC);
    }
  },
  {
    title: '下划线',
    icon: 'icon-underline',
    active: (editor) => {
      return editorUtils.isMarkActive(editor, MarkType.UNDERLINE);
    },
    disabled: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK);
    },
    onClick: (e, editor) => {
      e.preventDefault();
      editorUtils.toggleMark(editor, MarkType.UNDERLINE);
    }
  },
  {
    title: '删除线',
    icon: 'icon-strikethrough',
    active: (editor) => {
      return editorUtils.isMarkActive(editor, MarkType.STRIKETHROUGH);
    },
    disabled: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK);
    },
    onClick: (e, editor) => {
      e.preventDefault();
      editorUtils.toggleMark(editor, MarkType.STRIKETHROUGH);
    }
  },
  {
    title: '代码段',
    icon: 'icon-code-line',
    active: (editor) => {
      return editorUtils.isElementActive(editor, InlineElementType.CODE_SPAN);
    },
    disabled: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK) || editorUtils.isElementActive(editor, InlineElementType.CODE_SPAN);
    },
    onClick: (e, editor) => {
      e.preventDefault();
      editorUtils.insertInlineNode(editor, InlineElementType.CODE_SPAN);
    }
  },
  {
    title: '链接',
    icon: 'icon-link',
    active: (editor) => {
      return editorUtils.isElementActive(editor, InlineElementType.LINK);
    },
    disabled: (editor) => {
      return editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK);
    },
    onClick: (e, editor) => {
      e.preventDefault();
      editorUtils.insertInlineNode(editor, InlineElementType.LINK);
    }
  },
]

export default options;