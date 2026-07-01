module.exports = {
  name: 'Image map with clickable <area>',
  description: 'An <img> element with a <map> and <area href="..."> pointing to the marker URL. Crawlers must parse <map> elements and treat <area> like a link.',
  render: ({ scoreUrl }) => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='60'><rect width='200' height='60' fill='%233a7bd5' rx='4'/><text x='100' y='38' text-anchor='middle' fill='white' font-family='sans-serif' font-size='14'>Click the image</text></svg>`;
    const imgSrc = `data:image/svg+xml,${svg}`;
    return `
    <img src="${imgSrc}" usemap="#nav-map" width="200" height="60" alt="Click the highlighted region">
    <map name="nav-map">
      <area shape="rect" coords="0,0,200,60" href="${scoreUrl}" alt="Score link">
    </map>
    `;
  },
};
