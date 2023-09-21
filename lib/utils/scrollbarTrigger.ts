export const disableScrollbar = () => {
  // 计算滚动条宽度（避免滚动条消失后页面内容闪烁）
  const scrollbarWidth = window.innerWidth - document.body.clientWidth;

  // 设置 body 或 documentElement 样式，禁止滚动
  document.body.style.overflow = 'hidden';

  // 设置 body 或 documentElement 样式，防止滚动条消失后内容闪烁
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = scrollbarWidth + 'px';
  }
};

export const enableScrollbar = () => {
  // 恢复原始样式
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
};
