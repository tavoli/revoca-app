import Quill from 'quill';
import type BlockType from 'quill/blots/block';

const Block = Quill.import('blots/block') as typeof BlockType;

class DividerBlot extends Block {
  static blotName = 'divider';
  static tagName = 'hr';
}

Quill.register(DividerBlot);
