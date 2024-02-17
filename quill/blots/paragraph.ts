import Quill from 'quill';
import type BlockType from 'quill/blots/block';
import type Scroll from 'quill/blots/scroll';
import type {Blot} from 'parchment';
import type {Bounds} from 'quill/core/selection';

const Block = Quill.import('blots/block') as typeof BlockType;

export class ParagraphBlot extends Block {
  static blotName = 'block';
  static tagName = 'p';

  constructor(scroll: Scroll, domNode: HTMLElement) {
    super(scroll, domNode);

    this.domNode.addEventListener('mouseover', ParagraphBlot.mouseover);
  }

  static create() {
    const node = super.create();
    return node;
  }

  static mouseover(event: MouseEvent) {
    const p = event.target as HTMLParagraphElement;

    if (p.tagName !== 'P') return;

    const rect = p.getBoundingClientRect();

    const node = Quill.find(p) as Blot;
    const index = window.quill.getIndex(node);
    const bounds = window.quill.getBounds(index) as Bounds

    window.quill.setSelection(index, p.textContent?.length, 'silent');
    
    ParagraphBlot.leftPopup({top: bounds.top, left: rect.left});
  }

  static leftPopup(bounds: any) {
    const menu = document.querySelector("#leftMenu") as HTMLElement
    menu.style.display = "block";
    menu.style.top = `${bounds.top + 40}px`;
    menu.style.left = `${bounds.left - 40}px`;
  }
}

Quill.register(ParagraphBlot);
