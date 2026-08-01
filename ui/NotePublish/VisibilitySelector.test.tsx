import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import VisibilitySelector from './VisibilitySelector';

describe('VisibilitySelector', () => {
  it('exposes public and private choices and changes selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<VisibilitySelector value='public' onChange={onChange} />);

    expect(screen.getByRole('radio', { name: /公开/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /私密/ })).not.toBeChecked();

    await user.click(screen.getByRole('radio', { name: /私密/ }));
    expect(onChange).toHaveBeenCalledWith('private');
  });
});
