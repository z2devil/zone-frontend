import RootHeader from '@/ui/RootHeader';

interface ContentLayoutProps {
  children: React.ReactNode;
}

const RootRoutesLayout = (props: ContentLayoutProps) => {
  const { children } = props;

  return (
    <>
      <RootHeader />
      {children}
    </>
  );
};

export default RootRoutesLayout;
