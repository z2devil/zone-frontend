import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InlineElementType } from '@/lib/constants';
import LinkPreview from '.';

vi.mock('slate-react', () => ({
  useSlate: () => ({ isSummary: false }),
}));

const renderLink = (url: string) =>
  render(
    <LinkPreview
      element={{
        type: InlineElementType.LINK,
        url,
        children: [{ text: '链接' }],
      }}>
      链接
    </LinkPreview>
  );

describe('LinkPreview', () => {
  it('https 链接可点击', () => {
    renderLink('https://example.com');
    expect(screen.getByRole('link', { name: '链接' })).toHaveAttribute(
      'href',
      'https://example.com'
    );
  });

  it('javascript: 链接渲染为不可点击文本', () => {
    renderLink('javascript:alert(1)');
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('链接')).toBeInTheDocument();
  });
});
