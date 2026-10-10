import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BlockElementType } from '@/lib/constants';
import SteamVideoEdit from '.';

vi.mock('slate-react', () => ({
  useSlate: () => ({}),
  ReactEditor: { findPath: () => [0] },
}));

vi.mock('slate', () => ({
  Transforms: { setNodes: vi.fn() },
}));

const fetchMock = vi.fn(async () => ({
  json: async () => ({ hlsUrl: 'https://video.akamai.steamstatic.com/a' }),
}));
vi.stubGlobal('fetch', fetchMock);

afterEach(() => {
  fetchMock.mockClear();
});

const submit = (appId: string) => {
  render(
    <SteamVideoEdit
      element={{ type: BlockElementType.STEAM_VIDEO, children: [{ text: '' }] }}
    />
  );
  fireEvent.change(screen.getByPlaceholderText(/Steam App ID/), {
    target: { value: appId },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Fetch Video' }));
};

describe('SteamVideoEdit', () => {
  it('非数字 App ID 不发起请求', () => {
    submit('1&appId=2');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('App ID must be a number')).toBeInTheDocument();
  });

  it('数字 App ID 正常请求', () => {
    submit(' 2239770 ');
    expect(fetchMock).toHaveBeenCalledWith(
      '/local-api/steam-video?appId=2239770'
    );
  });
});
