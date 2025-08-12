import { MdastNode } from 'types/slate';
import remarkTransformNode from './remarkTransformNode';

/**
 * mdast 转 slate 插件
 */
function slateParse(this: any) {
  const compiler = (node: { children: Array<MdastNode> }) => {
    return node.children.flatMap(remarkTransformNode);
  };

  this.Compiler = compiler;
}

export default slateParse;
