module.exports = {
  name: 'history.replaceState() SPA navigation',
  description: 'Clicking "Go to page" calls history.replaceState() and swaps the visible content. Unlike pushState, replaceState modifies the current history entry without adding a new one — crawlers must still detect the DOM swap and discover the injected link.',
  render: ({ scoreUrl }) => `
    <div id="app">
      <p>This is the home view.</p>
      <button id="nav-btn" type="button">Go to page</button>
    </div>
    <script>
      (function() {
        var scoreUrl = ${JSON.stringify(scoreUrl)};
        document.getElementById('nav-btn').addEventListener('click', function() {
          history.replaceState({ page: 'detail' }, '', '/spa/detail-replaced');
          document.getElementById('app').innerHTML =
            '<p>This is the detail view.</p><a href="' + scoreUrl + '">Click me</a>';
        });
      })();
    </script>
  `,
};
