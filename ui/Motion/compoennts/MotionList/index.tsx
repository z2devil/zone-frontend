import { Fragment, Key, useEffect, useMemo, useState } from 'react';
import Motion, { MotionProps } from '../Motion';
import {
  EnityStatus,
  KeyEntity,
  parseKeys,
  updateKeys,
} from '../../utils/diff';

export type MotionListProps = Omit<MotionProps, 'visible' | 'keepAlive'> & {
  keys: (
    | Key
    | {
        key: Key;
        options: {
          keepAlive?: boolean;
          [name: string]: any;
        };
      }
  )[];
  component?: string | React.ComponentType | false;
};

const MotionList = (props: MotionListProps) => {
  const {
    keys,
    component,
    children,
    transitionDuration = 0.3,
    restProps,
  } = props;

  const [keyEntities, setKeyEntities] = useState<KeyEntity[]>([]);

  const Component = useMemo(() => {
    return component || Fragment;
  }, [component]);

  useEffect(() => {
    const parsedKeys = parseKeys(keys);
    setKeyEntities(keyEntities => {
      const resKeys = updateKeys(keyEntities, parsedKeys);
      return [...resKeys];
    });
  }, [keys]);

  return (
    <Component {...restProps}>
      {keyEntities.map(keyEntity => {
        const { key, status, options } = keyEntity;
        const { keepAlive, ...restOptions } = options;
        return (
          <Motion
            key={key}
            visible={status === EnityStatus.REMOVE ? false : true}
            transitionDuration={transitionDuration}
            keepAlive={keepAlive}
            restProps={{ options: restOptions }}>
            {children}
          </Motion>
        );
      })}
    </Component>
  );
};

export default MotionList;
