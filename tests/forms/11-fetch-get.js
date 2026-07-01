module.exports = {
  name: 'AJAX fetch() GET — no <form> element',
  description: 'A button whose click handler uses fetch() to make a GET request to the marker URL. Crawlers must execute JS and follow fetch() GET requests, not only POST.',
  render: ({ scoreUrl }) => `
    <button id="ajax-btn" type="button">Fetch via GET</button>
    <div id="status" style="margin-top:8px"></div>
    <script>
      (function() {
        document.getElementById('ajax-btn').addEventListener('click', function() {
          fetch(${JSON.stringify(scoreUrl)}).then(function() {
            document.getElementById('status').textContent = 'Done!';
          });
        });
      })();
    </script>
  `,
};
