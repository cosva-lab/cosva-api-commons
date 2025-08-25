export const cleanURL = (url?: string) => {
  if (!url) {
    console.log(`cleanURL(url = is "${url}")`);
    return '';
  }
  return url.replace(/\/$/, '') + '/';
};
