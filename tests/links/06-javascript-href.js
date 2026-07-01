module.exports = {
  name: 'Anchor with javascript: href and onclick',
  description: 'An anchor whose href is "javascript:void(0)" — a common pattern to suppress default navigation. The real navigation happens in the onclick handler via window.location.',
  render: ({ scoreUrl }) => `
    <a href="javascript:void(0)" id="js-link">Click me</a>
    <script>
      (function() {
        document.getElementById('js-link').addEventListener('click', function() {
          window.location.href = ${JSON.stringify(scoreUrl)};
        });
      })();
    </script>
  `,
};
