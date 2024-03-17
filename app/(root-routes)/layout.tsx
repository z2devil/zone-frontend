import RootHeader from '@/ui/RootHeader';

interface ContentLayoutProps {
  modal: React.ReactNode;
  children: React.ReactNode;
}

const RootRoutesLayout = (props: ContentLayoutProps) => {
  const { modal, children } = props;

  return (
    <>
      <RootHeader />
      {modal}
      {children}
    </>
  );
};

export default RootRoutesLayout;
