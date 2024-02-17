import Quill from 'quill';
import type BlockType from 'quill/blots/block';

import {ParagraphBlot} from './paragraph';

const Block = Quill.import('blots/block') as typeof BlockType;

class QuoteBlot extends Block {
  static blotName = 'blockquote';
  static tagName = 'blockquote';

  static create() {
    const node = super.create();
    node.addEventListener('mouseover', ParagraphBlot.mouseover);
    return node;
  }
}

Quill.register(QuoteBlot);
