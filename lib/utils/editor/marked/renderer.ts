import { RendererObject } from 'marked';
import { INLINE_ELEMENTS } from './constans';

const renderer: RendererObject = {
  // text: (text: string) => {
  //   console.log('[ text ]', text);
  //   return `<${INLINE_ELEMENTS.text.tag}>${text}</${INLINE_ELEMENTS.text.tag}>`;
  // },
  codespan: (text: string) => {
    console.log('[ codespan ]', text);
    return `<${INLINE_ELEMENTS.codespan.tag}>${text}</${INLINE_ELEMENTS.codespan.tag}>`;
  },
  em: (text: string) => {
    console.log('[ em ]', text);
    return `<${INLINE_ELEMENTS.em.tag}>${text}</${INLINE_ELEMENTS.em.tag}>`;
  },
  del: (text: string) => {
    console.log('[ del ]', text);
    return `<${INLINE_ELEMENTS.del.tag}>${text}</${INLINE_ELEMENTS.del.tag}>`;
  },
  // underline: (text: string) => {
  //   return `<${INLINE_ELEMENTS.underline.tag}>${text}</${INLINE_ELEMENTS.underline.tag}>`;
  // },
  strong: (text: string) => {
    console.log('[ strong ]', text);
    return `<${INLINE_ELEMENTS.strong.tag}>${text}</${INLINE_ELEMENTS.strong.tag}>`;
  },
  link: (href: string, title: string | null | undefined, text: string) => {
    console.log('[ link ]', href, title, text);
    return `<${INLINE_ELEMENTS.link.tag}><a href="${href}" title="${title}">${text}</a></${INLINE_ELEMENTS.link.tag}>`;
  },
  image: (href: string, title: string | null | undefined, text: string) => {
    console.log('[ image ]', href, title, text);
    return `<${INLINE_ELEMENTS.image.tag}><img href="${href}" title="${title}">${text}</img></${INLINE_ELEMENTS.image.tag}>`;
  },
};

export default renderer;
