import axios from 'axios';

export const getNextData = async ({ nextpage, type, id }) => {
  if (!nextpage) {
    return;
  }
  try {
    const queryString = new URLSearchParams(nextpage)
      .toString()
      .split('&')
      .join('%26');
    const { data } = await axios.get(
      `/nextpage/${type}/${id}?nextpage=${queryString}`
    );
    return data;
  } catch (err) {
    console.error(err);
  }
};
