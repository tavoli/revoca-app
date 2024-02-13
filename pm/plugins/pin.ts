import {Plugin} from "prosemirror-state";
import {Decoration, DecorationSet} from "prosemirror-view";

export default new Plugin({
  props: {
    decorations(state) {
      return this.getState(state)
    },
  },

  state: {
    init() {
      return DecorationSet.empty
    },

    apply(tr, set) {
      set = set.map(tr.mapping, tr.doc);
      const action = tr.getMeta('DECORATION');

      if (action && action.type === 'PIN_SELECTION') {
        const {from, to} = tr.selection;

        const deco = Decoration.inline(from, to, {
          nodeName: 'strong',
        });

        set = set.add(tr.doc, [deco]);
      }

      return set;
    }
  },

})
