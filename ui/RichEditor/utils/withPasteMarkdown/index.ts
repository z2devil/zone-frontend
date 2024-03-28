import { RichEditor } from 'types/slate';
import { unified } from 'unified';
import { Node } from 'slate';
import remarkParse from 'remark-parse';
import slateParse from './slateParse';

export const withPasteMarkdown = (editor: RichEditor) => {
  const { insertData } = editor;

  editor.insertData = data => {
    // TODO: 之后再处理 html
    const html = data.getData('text/html');
    const text = data.getData('text/plain');
    if (text) {
      const fragment = unified()
        .use(remarkParse)
        .use(slateParse)
        .processSync(text).result as Node[];

      console.log('[ fragment ]', fragment);
      editor.insertFragment(fragment);
      return;
    }
    insertData(data);
  };

  return editor;
};

export default withPasteMarkdown;
