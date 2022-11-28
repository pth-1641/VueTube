import axios from 'axios';

export const getNextData = async ({
  nextpage,
  type,
  id = '',
  options = {},
}) => {
  if (!nextpage) {
    return;
  }
  try {
    const nextpageOptions = Object.entries(options)
      .map((o) => `${o[0]}=${o[1]}`)
      .join('&');
    const queryString = new URLSearchParams(nextpage)
      .toString()
      .split('&')
      .join('%26');
    const { data } = await axios.get(
      `/nextpage/${type}/${id}?nextpage=${queryString}${
        Object.keys(options).length ? `&${nextpageOptions}` : ''
      }`
    );
    return data;
  } catch (err) {
    console.error(err);
  }
};
