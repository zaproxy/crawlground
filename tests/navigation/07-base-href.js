module.exports = {
  name: '<base href> changes relative URL resolution',
  description: 'The <head> contains a <base href> element that relocates the base for all relative URLs on the page. The score link uses a relative path that only resolves correctly when the base is applied — crawlers that ignore <base> will compute the wrong URL.',
  head: ({ scoreUrl }) => {
    const base = scoreUrl.substring(0, scoreUrl.lastIndexOf('/') + 1);
    return `<base href="${base}">`;
  },
  render: ({ scoreUrl }) => {
    const rel = scoreUrl.substring(scoreUrl.lastIndexOf('/') + 1);
    return `<a href="${rel}">Click me</a>`;
  },
};
