export const xmlToSubtitle = (xml) => {
  const subTagsRegex = /<\s*p[^>]*>([^<]*)<\s*\/\s*p\s*>/g;
  const formatXML = xml.split('<br />').join(' ');
  const subTags = formatXML.match(subTagsRegex);
  const timeCollection = subTags.map((tag) => {
    tag = tag.replace(/\n|\r/g, '');
    const text = tag.match(/<p[^>]+>(.*?)<\/p>/)[1];
    const start = tag.match(/begin\=\"(.*?)"/)[1].split(':');
    const end = tag.match(/end\=\"(.*?)"/)[1].split(':');
    const startTime = parseInt(
      +start[0] * 360 + +start[1] * 60 + Math.round(start[2])
    );
    const endTime = parseInt(+end[0] * 360 + +end[1] * 60 + Math.round(end[2]));
    return {
      startTime,
      endTime,
      text,
    };
  });
  return timeCollection;
};
