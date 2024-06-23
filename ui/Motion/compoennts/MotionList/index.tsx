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
            keepAlive={keepAlive}
            key={key}
            restProps={{ options: restOptions }}
            transitionDuration={transitionDuration}
            visible={status === EnityStatus.REMOVE ? false : true}>
            {children}
          </Motion>
        );
      })}
    </Component>
  );
};

export default MotionList;
