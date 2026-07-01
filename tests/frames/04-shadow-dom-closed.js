module.exports = {
  name: 'Link inside closed Shadow DOM',
  description: 'The score link is appended to a shadow root created with mode:"closed". Unlike open shadow DOM, the root is not accessible via element.shadowRoot — crawlers relying on JS reflection to enumerate shadow roots will not find it.',
  render: ({ scoreUrl }) => `
    <div id="shadow-host"></div>
    <script>
      (function() {
        var root = document.getElementById('shadow-host').attachShadow({ mode: 'closed' });
        var a = document.createElement('a');
        a.href = ${JSON.stringify(scoreUrl)};
        a.textContent = 'Click me';
        root.appendChild(a);
      })();
    </script>
  `,
};
