export const xmlToSubtitle = (xml) => {
  const subTagsRegex = /<\s*p[^>]*>([^<]*)<\s*\/\s*p\s*>/g;
  const subTags = xml.match(subTagsRegex);
  const timeCollection = subTags.map((tag) => {
    const text = tag.match(/<p[^>]+>(.*?)<\/p>/)[1];
    const start = tag
      .match(/begin\=\"(.*?)"/)[1]
      .split('.')[0]
      .split(':');
    const end = tag
      .match(/end\=\"(.*?)"/)[1]
      .split('.')[0]
      .split(':');
    const startTime = parseInt(+start[0] * 360 + +start[1] * 60 + +start[2]);
    const endTime = parseInt(+end[0] * 360 + +end[1] * 60 + +end[2]);
    return {
      startTime,
      endTime,
      text,
    };
  });
  return timeCollection;
};
