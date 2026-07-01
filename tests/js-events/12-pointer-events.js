module.exports = {
  name: 'pointerup event triggers navigation',
  description: 'A div styled as a button fires navigation on pointerup, not click. Crawlers that only synthesise click events will miss this — pointer events (pointerdown/pointerup) must also be dispatched.',
  render: ({ scoreUrl }) => `
    <div id="ptr-btn" role="button" tabindex="0"
         style="display:inline-block;padding:8px 16px;background:#3a7bd5;color:#fff;border-radius:4px;cursor:pointer">
      Press me
    </div>
    <script>
      (function() {
        document.getElementById('ptr-btn').addEventListener('pointerup', function() {
          window.location.href = ${JSON.stringify(scoreUrl)};
        });
      })();
    </script>
  `,
};
