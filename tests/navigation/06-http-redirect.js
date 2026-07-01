module.exports = {
  name: 'HTTP 302 redirect to marker URL',
  description: 'A link that points to a server endpoint which immediately issues an HTTP 302 redirect to the marker URL. Crawlers must follow server-side redirects to score.',
  render: ({ scoreUrl }) => {
    const redirectUrl = `/api/redirect?url=${encodeURIComponent(scoreUrl)}`;
    return `<a href="${redirectUrl}">Click me</a>`;
  },
};
