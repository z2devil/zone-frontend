import React, { useMemo, useCallback } from 'react';
import { useSlate } from 'slate-react';
import { clsx } from 'clsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/components/ui/tooltip';
import options from '../../options';
import styles from './style.module.scss';

interface ToolButtonProps {
  option: Exclude<(typeof options)[0], 'separator'>;
}

const ToolButton = React.memo<ToolButtonProps>(({ option }) => {
  const editor = useSlate();

  const active = useMemo(() => {
    return typeof option.active === 'function'
      ? option.active(editor)
      : option.active;
  }, [option, editor]);

  const disabled = useMemo(() => {
    return typeof option.disabled === 'function'
      ? option.disabled(editor)
      : option.disabled;
  }, [option, editor]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      option.onClick(event, editor);
    },
    [option, editor]
  );

  const buttonClasses = clsx(
    styles['tool-button'],
    disabled ? styles['tool-button-disabled'] : styles['tool-button-enabled'],
    {
      [styles['tool-button-active']]: active,
    }
  );

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label={option.title}
            className={buttonClasses}
            disabled={disabled}
            onMouseDown={handleMouseDown}>
            <i className={clsx('iconfont', styles['tool-icon'], option.icon)} />
          </button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>
          <span>{option.title}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

ToolButton.displayName = 'ToolButton';

export default ToolButton;
