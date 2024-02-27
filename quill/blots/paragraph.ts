import Quill from 'quill';
import type BlockType from 'quill/blots/block';
import type Scroll from 'quill/blots/scroll';
import type {Blot} from 'parchment';
import type {Bounds} from 'quill/core/selection';

const Block = Quill.import('blots/block') as typeof BlockType;

let counter = 0;

export class ParagraphBlot extends Block {
  static blotName = 'block';
  static tagName = 'p';

  constructor(scroll: Scroll, domNode: HTMLElement) {
    super(scroll, domNode);

    this.domNode.addEventListener('mouseover', ParagraphBlot.mouseover);
    this.domNode.addEventListener('mouseup', ParagraphBlot.mouseclick);
    this.domNode.addEventListener('mousedown', ParagraphBlot.mouseclick);
  }

  static create() {
    const node = super.create();
    return node;
  }

  static mouseclick(event: MouseEvent) {
    counter += 1;

    if (counter < 2) {
      return;
    }

    const selection = window.quill.getSelection();
    if (selection?.index && selection.length) {
      // mouse click will be the bounds
      const bounds = window.quill.getBounds(selection.index) as Bounds;
      // TODO - improve left bound
      ParagraphBlot.floatPopup({...bounds, left: event.x});

      counter = 0;
    }

    if (!selection?.length) {
      counter = 0;
      ParagraphBlot.hidePopup();
    }
  }

  static mouseover(event: MouseEvent) {
    const p = event.target as HTMLParagraphElement;

    if (p.tagName !== 'P') return;
    if (!p.textContent) return;

    const rect = p.getBoundingClientRect();

    const node = Quill.find(p) as Blot;
    const index = window.quill.getIndex(node);
    const bounds = window.quill.getBounds(index) as Bounds

    const dispatch = new CustomEvent('virtual-selection', {
      detail: { index, length: p.textContent.length }
    });

    window.dispatchEvent(dispatch);
    
    ParagraphBlot.leftPopup({top: bounds.top, left: rect.left});
  }

  static leftPopup(bounds: any) {
    const menu = document.querySelector("#leftMenu") as HTMLElement
    menu.style.display = "block";
    menu.style.top = `${bounds.top + 40}px`;
    menu.style.left = `${bounds.left - 40}px`;
  }

  static floatPopup(bounds: any) {
    const menu = document.querySelector("#floatMenu") as HTMLElement
    menu.style.display = "block";
    menu.style.top = `${bounds.top + 70}px`;
    menu.style.left = `${bounds.left - 0}px`;
  }

  static hidePopup() {
    const menu = document.querySelector("#floatMenu") as HTMLElement
    menu.style.display = "none";
  }
}

Quill.register(ParagraphBlot);
