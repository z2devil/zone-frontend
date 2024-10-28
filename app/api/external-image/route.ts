'use server';

import { NextRequest, NextResponse } from 'next/server';

/**
 * 获取远端图片
 */
export async function GET(req: NextRequest) {
  try {
    // 从请求体中获取参数
    const url = req.nextUrl.searchParams.get('url');

    // 检查参数是否存在
    if (!url) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const response = await fetch(url);

    // 检查请求是否成功
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: 500 }
      );
    }

    // 获取图片的二进制数据
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg', // 默认内容类型
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: Error }, { status: 500 });
  }
}
