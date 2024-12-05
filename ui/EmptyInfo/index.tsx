import Button from '../Button';
import EmptyTipImg from '../../public/tip/empty_data.png';
import Image from 'next/image';

interface EmptyInfoProps {
  tip: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const EmptyInfo = (props: EmptyInfoProps) => {
  const { tip, buttonText, onButtonClick } = props;

  return (
    <div className='mx-auto flex h-fit w-fit flex-col items-center justify-center overflow-hidden'>
      <Image
        priority
        alt='empty'
        className='pointer-events-none select-none'
        height={256}
        src={EmptyTipImg}
        width={256}
      />
      <span className='text-center text-17 text-black-600'>{tip}</span>
      {buttonText ? (
        <Button className='' onClick={onButtonClick}>
          {buttonText}
        </Button>
      ) : null}
    </div>
  );
};

export default EmptyInfo;
