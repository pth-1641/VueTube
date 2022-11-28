import { formatCommaViews } from './format-view-count';

export const convertTimer = (totalSeconds) => {
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  let seconds = totalSeconds - hours * 3600 - minutes * 60;

  const formatTime = [hours, minutes, seconds].map((t) =>
    t < 10 ? '0' + t : t
  );

  return parseInt(formatTime[0]) !== 0
    ? `${formatCommaViews(formatTime[0])}:${formatTime[1]}:${formatTime[2]}`
    : `${formatTime[1]}:${formatTime[2]}`;
};
