module.exports = {
  name: 'localStorage token gates score link',
  description: 'A button sets a flag in localStorage, then re-renders the page content without a navigation. The score link is only shown once the flag is present — either after clicking the button in the same session, or on a return visit if the crawler shares localStorage state across page loads.',
  render: ({ scoreUrl }) => `
    <div id="content"></div>
    <script>
      (function() {
        var KEY = 'crawlground_ls_visited';
        var scoreUrl = ${JSON.stringify(scoreUrl)};
        function render() {
          var div = document.getElementById('content');
          if (localStorage.getItem(KEY) === '1') {
            var a = document.createElement('a');
            a.href = scoreUrl;
            a.textContent = 'Click me';
            div.innerHTML = '';
            div.appendChild(a);
          } else {
            div.innerHTML = '<button id="ls-btn" type="button">Set flag</button>';
            document.getElementById('ls-btn').addEventListener('click', function() {
              localStorage.setItem(KEY, '1');
              render();
            });
          }
        }
        render();
      })();
    </script>
  `,
};
