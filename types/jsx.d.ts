import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'code-span': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
