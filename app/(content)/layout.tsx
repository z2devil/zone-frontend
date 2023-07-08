const ContentLayout = ({ children }) => {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-1 flex-col'>{children}</div>
    </div>
  );
};
export default ContentLayout;
