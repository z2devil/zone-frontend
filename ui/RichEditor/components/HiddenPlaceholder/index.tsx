interface HiddenPlaceholderProps {
  children: React.ReactNode;
}

const HiddenPlaceholder = ({ children }: HiddenPlaceholderProps) => {
  return (
    <div
      style={{
        fontSize: 0,
        height: 0,
      }}>
      {children}
    </div>
  );
};

export default HiddenPlaceholder;
