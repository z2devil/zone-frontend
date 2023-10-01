'use client';

import { ModalUtils, useModal } from '@/ui/Modal';
import { useEffect } from 'react';
import { atom, useSetRecoilState } from 'recoil';

export const modalUtilsState = atom<ModalUtils | null>({
  key: 'modalUtilsState',
  default: null,
});

const ModalUtilsProvider = () => {
  const [modalUtils, modalHolder] = useModal();

  const setModalStore = useSetRecoilState(modalUtilsState);

  useEffect(() => {
    setModalStore(modalUtils);
  }, [modalUtils, setModalStore]);

  return <>{modalHolder}</>;
};

export default ModalUtilsProvider;
