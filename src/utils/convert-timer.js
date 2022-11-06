export const convertTimer = (totalSeconds) => {
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  let seconds = totalSeconds - hours * 3600 - minutes * 60;

  const time = [hours, minutes, seconds].map((t) => (t < 10 ? '0' + t : t));

  return parseInt(time[0]) !== 0
    ? `${time[0]}:${time[1]}:${time[2]}`
    : `${time[1]}:${time[2]}`;
};
