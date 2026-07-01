module.exports = {
  name: 'CustomEvent dispatched by button click',
  description: 'Clicking the button dispatches a custom DOM event ("navigate"). A separate listener on the document handles that event and navigates to the score URL. Crawlers must follow chains of DOM events, not only standard click handlers.',
  render: ({ scoreUrl }) => `
    <button id="dispatch-btn" type="button">Click me</button>
    <script>
      (function() {
        var scoreUrl = ${JSON.stringify(scoreUrl)};
        document.addEventListener('navigate', function(e) {
          if (e.detail && e.detail.url) window.location.href = e.detail.url;
        });
        document.getElementById('dispatch-btn').addEventListener('click', function() {
          document.dispatchEvent(new CustomEvent('navigate', { detail: { url: scoreUrl } }));
        });
      })();
    </script>
  `,
};
