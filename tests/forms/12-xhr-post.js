module.exports = {
  name: 'XMLHttpRequest POST',
  description: 'A button that submits via XMLHttpRequest — the older AJAX API still common in legacy code. Crawlers must handle XHR requests, not only the newer fetch() API.',
  render: ({ scoreUrl }) => `
    <button id="xhr-btn" type="button">Submit via XHR</button>
    <div id="status" style="margin-top:8px"></div>
    <script>
      (function() {
        document.getElementById('xhr-btn').addEventListener('click', function() {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', ${JSON.stringify(scoreUrl)});
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.onload = function() {
            document.getElementById('status').textContent = 'Done!';
          };
          xhr.send(JSON.stringify({ source: 'xhr' }));
        });
      })();
    </script>
  `,
};
