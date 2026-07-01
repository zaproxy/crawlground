module.exports = {
  name: 'window.open() navigation',
  description: 'A button calls window.open() with the marker URL. Crawlers must detect window.open() calls and visit the target URL to score.',
  render: ({ scoreUrl }) => `
    <button id="open-btn" type="button">Open popup</button>
    <script>
      (function() {
        document.getElementById('open-btn').addEventListener('click', function() {
          window.open(${JSON.stringify(scoreUrl)}, '_blank', 'width=400,height=300');
        });
      })();
    </script>
  `,
};
