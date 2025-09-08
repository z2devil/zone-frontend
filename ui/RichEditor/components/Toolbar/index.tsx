import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import options from './options';
import styles from './style.module.scss';
import { ToolButton, Separator } from './components';

interface ToolbarProps {
  className?: string;
  RightSlot?: React.ReactNode;
}

const Toolbar = React.memo<ToolbarProps>(props => {
  const { className, RightSlot } = props;

  const toolbarClasses = useMemo(() => {
    return clsx(twMerge(styles.toolbar, className));
  }, [className]);

  const renderOptions = useMemo(() => {
    return options.map((option, index) => {
      if (option === 'separator') {
        return <Separator key={`separator-${index}`} />;
      }

      return (
        <ToolButton key={`tool-${option.title}-${index}`} option={option} />
      );
    });
  }, []);

  return (
    <div className={toolbarClasses}>
      <div className={styles['toolbar-content']}>{renderOptions}</div>
      {RightSlot}
    </div>
  );
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;
