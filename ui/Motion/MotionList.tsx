import {
  Fragment,
  Key,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Motion, { MotionProps } from './Motion';
import { EnityStatus, KeyEntity, parseKeys, updateKeys } from './utils/diff';

export interface MotionListProps extends Omit<MotionProps, 'onVisibleChanged'> {
  keys: (Key | { key: Key; [name: string]: any })[];
  component?: string | React.ComponentType | false;
  transitionDuration?: number;
  onVisibleChanged?: (visible: boolean, info: { key: React.Key }) => void;
  onAllRemoved?: () => void;
}

const MotionList = (props: MotionListProps) => {
  const {
    keys,
    component,
    transitionDuration = 0.3,
    children,
    onVisibleChanged,
    onAllRemoved,
    ...restProps
  } = props;

  const [keyEntities, setKeyEntities] = useState<KeyEntity[]>([]);

  const Component = useMemo(() => {
    return component || Fragment;
  }, [component]);

  useEffect(() => {
    const parsedKeys = parseKeys(keys);
    setKeyEntities(keyEntities => {
      const resKeys = updateKeys(keyEntities, parsedKeys);
      return resKeys;
    });
  }, [keys]);

  const remindKeysLength = useMemo(() => {
    return keyEntities.filter(({ status }) => status !== EnityStatus.REMOVE)
      .length;
  }, [keyEntities]);

  const handleVisibleChanged = useCallback(
    (visible: boolean, key: React.Key) => {
      onVisibleChanged?.(visible, { key });
      if (!visible && remindKeysLength === 0) {
        onAllRemoved?.();
      }
    },
    [remindKeysLength, onVisibleChanged, onAllRemoved]
  );

  return (
    <Component {...restProps}>
      {keyEntities.map(keyEntity => {
        const { key, status, ...restEntityProps } = keyEntity;
        return (
          <Motion
            key={key}
            visible={status === EnityStatus.REMOVE ? false : true}
            restProps={restEntityProps}
            motionName='transition'
            transitionDuration={transitionDuration}
            onVisibleChanged={visible => handleVisibleChanged(visible, key)}>
            {children}
          </Motion>
        );
      })}
    </Component>
  );
};

export default MotionList;
