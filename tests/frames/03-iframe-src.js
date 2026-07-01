module.exports = {
  name: 'Link inside same-origin iframe (src URL)',
  description: 'The score link is inside an <iframe> loaded from a URL — not inline srcdoc. The browser makes a separate HTTP request for the iframe content, requiring crawlers to discover and request iframe src URLs.',
  render: ({ scoreUrl }) => {
    const iframeSrc = `/api/page?url=${encodeURIComponent(scoreUrl)}`;
    return `<iframe src="${iframeSrc}" style="width:300px;height:60px;border:1px solid #ccc"></iframe>`;
  },
};
