import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'code-line': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
