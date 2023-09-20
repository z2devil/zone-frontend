import RootHeader from '@/ui/RootHeader';

interface ContentLayoutProps {
  children: React.ReactNode;
}

const ContentLayout = (props: ContentLayoutProps) => {
  const { children } = props;

  return (
    <>
      <RootHeader />
      {children}
    </>
  );
};

export default ContentLayout;
