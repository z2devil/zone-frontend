import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import VerificationCodeInput from './index';

it('keeps preceding digits while entering a verification code', async () => {
  const user = userEvent.setup();
  const handleChange = vi.fn();
  render(<VerificationCodeInput length={4} onChange={handleChange} />);

  const inputs = screen.getAllByRole('textbox');
  await user.type(inputs[0], '1');
  await user.type(inputs[1], '2');
  await user.type(inputs[2], '3');
  await user.type(inputs[3], '4');

  expect(handleChange).toHaveBeenLastCalledWith('1234');
});

it('replaces stale digits when pasting a shorter verification code', () => {
  const handleChange = vi.fn();
  render(<VerificationCodeInput length={4} onChange={handleChange} />);

  const inputs = screen.getAllByRole('textbox');
  fireEvent.paste(inputs[0], {
    clipboardData: { getData: () => '1234' },
  });
  fireEvent.paste(inputs[0], {
    clipboardData: { getData: () => '56' },
  });

  expect(handleChange).toHaveBeenLastCalledWith('56');
});
