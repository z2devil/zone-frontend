import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './page';

const mocks = vi.hoisted(() => ({
  clearNotes: vi.fn(),
  push: vi.fn(),
  sendCode: vi.fn(),
  setToken: vi.fn(),
  setUserInfo: vi.fn(),
  sign: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/lib/hooks/useRequest', () => ({
  default: () => [{}],
}));

vi.mock('@/lib/api/user', () => ({
  getVerificationCodeAPI: () => mocks.sendCode,
  signAPI: () => mocks.sign,
}));

vi.mock('@/lib/stores', () => ({
  useAuthStore: (
    selector: (state: {
      setToken: typeof mocks.setToken;
      setUserInfo: typeof mocks.setUserInfo;
    }) => unknown
  ) =>
    selector({
      setToken: mocks.setToken,
      setUserInfo: mocks.setUserInfo,
    }),
}));

vi.mock('@/lib/stores/notes', () => ({
  useNotesStore: (
    selector: (state: { clear: typeof mocks.clearNotes }) => unknown
  ) => selector({ clear: mocks.clearNotes }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sendCode.mockResolvedValue(undefined);
    mocks.sign.mockResolvedValue({
      info: {
        _id: 'user-1',
        avatarPath: '',
        email: 'user@example.com',
        lv: 1,
        nickname: 'User',
      },
      token: 'token',
    });
  });

  it('does not submit the email when Enter is confirming IME composition', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText('邮箱');

    await user.type(emailInput, 'user@example.com');
    fireEvent.compositionStart(emailInput);
    fireEvent.keyDown(emailInput, {
      code: 'Enter',
      isComposing: true,
      key: 'Enter',
      keyCode: 229,
    });
    fireEvent.compositionEnd(emailInput);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mocks.sendCode).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');
    await waitFor(() => expect(mocks.sendCode).toHaveBeenCalledTimes(1));
  });

  it('allows a valid retry after client-side validation fails', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: '获取验证码' }));
    expect(screen.getByText('邮箱不能为空')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('邮箱'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: '获取验证码' }));

    await waitFor(() => expect(mocks.sendCode).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('输入验证码')).toBeInTheDocument();
  });

  it('deduplicates simultaneous form submissions', async () => {
    const user = userEvent.setup();
    let resolveRequest: (() => void) | undefined;
    mocks.sendCode.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveRequest = resolve;
        })
    );
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('邮箱');
    await user.type(emailInput, 'user@example.com');
    const form = emailInput.closest('form');
    if (!form) throw new Error('登录输入框应位于表单内');

    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => expect(mocks.sendCode).toHaveBeenCalledTimes(1));
    resolveRequest?.();
  });

  it('offers a resend action after entering the verification-code step', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText('邮箱'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: '获取验证码' }));

    expect(
      await screen.findByRole('button', { name: /重新发送/ })
    ).toBeInTheDocument();
  });
});
