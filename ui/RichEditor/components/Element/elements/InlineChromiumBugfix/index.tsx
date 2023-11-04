const InlineChromiumBugfix = () => (
  <span contentEditable={false} className='text-[0px]'>
    {String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

export default InlineChromiumBugfix;
