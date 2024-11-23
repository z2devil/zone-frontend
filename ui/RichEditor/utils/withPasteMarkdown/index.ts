import { RichEditor } from 'types/slate';
import { unified } from 'unified';
import { Node } from 'slate';
import remarkParse from 'remark-parse';
import slateParse from './slateParse';
import deserializeHTML from './deserializeHTML';

export const withPasteMarkdown = (editor: RichEditor) => {
  const { insertData } = editor;

  editor.insertData = data => {
    navigator.clipboard
      .read()
      .then(items => {
        for (const item of items) {
          console.log('[ item ]', item);
        }
      })
      .catch(err => {
        console.error('Error accessing clipboard: ', err);
      });
    const html = data.getData('text/html');
    console.log('[ html ]', html);
    const text = data.getData('text/plain');
    console.log('[ text ]', text);
    // if (html) {
    //   const parsed = new DOMParser().parseFromString(html, 'text/html');
    //   const fragment = deserializeHTML(parsed.body);
    //   editor.insertFragment(fragment as any);
    //   return;
    // } else
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
