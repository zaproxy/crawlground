module.exports = {
  name: 'Anchor with target="_blank"',
  description: 'A link with target="_blank" that opens the marker URL in a new tab. Crawlers must follow the href even though it targets a separate browsing context.',
  render: ({ scoreUrl }) => `
    <a href="${scoreUrl}" target="_blank" rel="noopener">Open in new tab</a>
  `,
};
