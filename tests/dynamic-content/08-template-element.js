module.exports = {
  name: 'Score link inside <template> element',
  description: 'The score link lives inside a <template> element, which is inert — its subtree is not rendered and links inside are not reachable by static HTML parsing. A button clones the template into the live DOM to reveal the link.',
  render: ({ scoreUrl }) => `
    <template id="link-tpl">
      <a href="${scoreUrl}">Click me</a>
    </template>
    <button id="use-tpl" type="button">Load content</button>
    <div id="slot"></div>
    <script>
      (function() {
        document.getElementById('use-tpl').addEventListener('click', function() {
          var tpl = document.getElementById('link-tpl');
          document.getElementById('slot').appendChild(tpl.content.cloneNode(true));
          document.getElementById('use-tpl').hidden = true;
        });
      })();
    </script>
  `,
};
