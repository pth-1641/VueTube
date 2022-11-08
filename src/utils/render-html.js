export const renderHTML = (des) => {
  const replaceNewLine = des?.split('\n').join('<br/>');
  //   const hashtagRegex = /(^|\s)(#[a-z\d-]+)/gi;
  //   const highlightHashtag = removeNewLine?.replace(
  //     hashtagRegex,
  //     "$1<span style='color:red'>$2</span>"
  //   );
  //   console.log(highlightHashtag);
  return replaceNewLine;
};
