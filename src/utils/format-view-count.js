export const formatViews = (views) => {
  if (views < 1e3) return views;
  if (views >= 1e3 && views < 1e4)
    return parseFloat((views / 1e3).toFixed(1)) + 'K';
  if (views >= 1e4 && views < 1e6) return (views / 1e3).toFixed(0) + 'K';
  if (views >= 1e6 && views < 1e9)
    return parseFloat((views / 1e6).toFixed(1)) + 'M';
  if (views >= 1e9 && views < 1e12)
    return parseFloat((views / 1e9).toFixed(1)) + 'B';
  if (views >= 1e12) return +(views / 1e12).toFixed(1) + 'T';
};

export const formatCommaViews = (views) => Number(views).toLocaleString();
