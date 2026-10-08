import { NextRequest, NextResponse } from 'next/server';
import { ExternalImageError, fetchExternalImage } from './guard';

// 依赖 node:dns / node:http，不能运行在 Edge
export const runtime = 'nodejs';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; sandbox",
};

const fail = (status: number, error: string) =>
  NextResponse.json({ error }, { status, headers: SECURITY_HEADERS });

/**
 * 获取远端图片，供编辑器把外链图片转存到 OSS。
 * 只代理公网 http(s) 上的位图，见 ./guard.ts。
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return fail(400, 'Missing required parameters');
  }

  try {
    const { contentType, body } = await fetchExternalImage(url);

    return new NextResponse(body, {
      status: 200,
      headers: {
        ...SECURITY_HEADERS,
        'Content-Type': contentType,
        'Content-Length': body.byteLength.toString(),
      },
    });
  } catch (error) {
    if (error instanceof ExternalImageError) {
      return fail(error.status, error.message);
    }
    return fail(502, 'Failed to fetch image');
  }
}
