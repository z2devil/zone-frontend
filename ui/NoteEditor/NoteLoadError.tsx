import Button from '@/ui/Button';

interface NoteLoadErrorProps {
  onRetry: () => void;
  onBack: () => void;
}

/**
 * 笔记加载失败。文案不区分「不存在」与「无权限」，避免泄露私密笔记是否存在。
 */
const NoteLoadError = (props: NoteLoadErrorProps) => {
  const { onRetry, onBack } = props;

  return (
    <div className='fixed inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-white'>
      <h1 className='text-19 font-bold text-black-900'>笔记不存在或加载失败</h1>
      <div className='flex gap-4'>
        <Button
          className='rounded-3xl border border-black-100 px-5 py-2'
          onClick={onBack}>
          返回
        </Button>
        <Button
          className='rounded-3xl bg-primary-50 px-5 py-2 text-white hover:bg-primary-100'
          onClick={onRetry}>
          重试
        </Button>
      </div>
    </div>
  );
};

export default NoteLoadError;
