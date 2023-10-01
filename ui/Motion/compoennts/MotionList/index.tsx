import { Fragment, Key, useEffect, useMemo, useState } from 'react';
import Motion, { MotionProps } from '../Motion';
import {
  EnityStatus,
  KeyEntity,
  parseKeys,
  updateKeys,
} from '../../utils/diff';

export interface MotionListProps extends MotionProps {
  keys: (Key | { key: Key; [name: string]: any })[];
  component?: string | React.ComponentType | false;
}

const MotionList = (props: MotionListProps) => {
  const {
    keys,
    component,
    transitionDuration = 0.3,
    children,
    ...restProps
  } = props;

  const [keyEntities, setKeyEntities] = useState<KeyEntity[]>([]);

  useEffect(() => {
    console.log(keyEntities);
  }, [keyEntities]);

  const Component = useMemo(() => {
    return component || Fragment;
  }, [component]);

  useEffect(() => {
    const parsedKeys = parseKeys(keys);
    setKeyEntities(keyEntities => {
      const resKeys = updateKeys(keyEntities, parsedKeys);
      console.log('[ resKeys ]', resKeys);
      return [...resKeys];
    });
  }, [keys]);

  return (
    <Component {...restProps}>
      {keyEntities.map(keyEntity => {
        const { key, status, ...restEntityProps } = keyEntity;
        return (
          <Motion
            key={key}
            visible={status === EnityStatus.REMOVE ? false : true}
            restProps={restEntityProps}
            transitionDuration={transitionDuration}>
            {children}
          </Motion>
        );
      })}
    </Component>
  );
};

export default MotionList;
