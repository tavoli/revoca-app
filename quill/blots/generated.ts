import Quill from 'quill';
import type InlineType from 'quill/blots/inline';

const Inline = Quill.import('blots/inline') as typeof InlineType;

class GeneratedBlot extends Inline {
  static blotName = 'generated';
  static tagName = 'blockquote';

}

Quill.register(GeneratedBlot);
