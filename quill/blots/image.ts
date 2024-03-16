import Quill from 'quill';
import type BlockType from 'quill/blots/block';
import type Scroll from 'quill/blots/scroll';

const BlockEmbed = Quill.import('blots/block/embed') as typeof BlockType;

class ImageBlot extends BlockEmbed {
  static blotName = 'image';
  static tagName = 'img';

  constructor(scroll: Scroll, domNode: HTMLElement) {
    super(scroll, domNode);

    this.domNode.addEventListener('click', ImageBlot.onclick);
  }

  static create(value: {alt: string, url: string}) {
    const node = super.create();
    node.setAttribute('alt', value.alt);
    node.setAttribute('src', value.url);
    node.classList.add('cursor-pointer');
    return node;
  }

  static value(node: HTMLElement) {
    return {
      alt: node.getAttribute('alt'),
      url: node.getAttribute('src')
    };
  }

  static onclick(event: MouseEvent) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const imageNode = Quill.find(event.target as HTMLElement) as ImageBlot;
          const index = window.quill.getIndex(imageNode);
          window.quill.deleteText(index, 1);
          window.quill.insertEmbed(index, 'image', {
            alt: file.name,
            url: reader.result
          });
          window.quill.setSelection(index + 1);
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  }
}

Quill.register(ImageBlot);
