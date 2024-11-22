import RootHeader from '@/ui/RootHeader';
import SiteRecord from '@/ui/SiteRecord/SiteRecord';

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
      <SiteRecord />
    </>
  );
};

export default RootRoutesLayout;
