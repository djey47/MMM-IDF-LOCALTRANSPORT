/* @flow */

export const formatDateFull = (date?: Date) => {
  if (!date) {return '';}

  const hours = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();

  return `${hours}:${min > 9 ? '' : '0'}${min}:${sec > 9 ? '' : '0'}${sec}`;
};
