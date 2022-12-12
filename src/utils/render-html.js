const mainColor = '#41b883';

export const renderHTML = (des) => {
  let str = des;
  // Reset string
  str = str.replace(/<(a)[^>]*>/g, '');
  str = str.replace(/\n/g, '<br />');
  // Hashtag
  const hashtagRegex = /#[^\s!@#$%^&*()=+.\/,\[{\]};:'"?><]+/g;
  str = str.replace(
    hashtagRegex,
    (hashtag) => `<span style="color: ${mainColor}">${hashtag}</span>`
  );
  // Link
  const linkRegex =
    /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g;
  str = str.replace(
    linkRegex,
    (link) =>
      `<a style="color: ${mainColor}; text-decoration: none" href="
    ${link}" target="_blank" ref="noopener">${link}</a>`
  );
  // Email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
  str = str.replace(
    emailRegex,
    (email) =>
      `<a style="color:${mainColor}; text-decoration: none" href="mailto:${email}">${email}</a>`
  );
  // Time
  const timeRegex = /(?:(\d{1,2}):)?(\d{1,2}):(\d{2})/g;
  str = str.replace(
    timeRegex,
    (time) => `<span style="color: ${mainColor}">${time}</span>`
  );

  return str;
};

export const resetString = (des) => {
  let str = des;
  str = str.replace(/&nbsp;/g, '');
  str = str.replace(/<[^>]*>/g, '');
  return str;
};
