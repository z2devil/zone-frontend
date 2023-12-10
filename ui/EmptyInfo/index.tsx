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
        className=' pointer-events-none select-none'
        src={EmptyTipImg}
        alt='empty'
        width={256}
        height={256}
      />
      <span className=' text-center text-17 text-black-600'>{tip}</span>
      {buttonText ? (
        <Button className='' onClick={onButtonClick}>
          {buttonText}
        </Button>
      ) : null}
    </div>
  );
};

export default EmptyInfo;
