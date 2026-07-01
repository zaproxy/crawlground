module.exports = {
  name: 'Long press (mousedown hold) triggers navigation',
  description: 'Navigation fires only after holding mousedown for 600 ms without releasing. A standard quick click does nothing — crawlers must simulate a sustained press rather than an instant click.',
  render: ({ scoreUrl }) => `
    <div id="hold-btn" role="button" tabindex="0"
         style="display:inline-block;padding:8px 16px;background:#3a7bd5;color:#fff;border-radius:4px;cursor:pointer;user-select:none">
      Hold me
    </div>
    <div id="hint" style="margin-top:8px;color:#666;font-size:13px">Hold for 600 ms to navigate</div>
    <script>
      (function() {
        var btn = document.getElementById('hold-btn');
        var timer = null;
        btn.addEventListener('mousedown', function() {
          timer = setTimeout(function() {
            window.location.href = ${JSON.stringify(scoreUrl)};
          }, 600);
        });
        btn.addEventListener('mouseup', function() { clearTimeout(timer); });
        btn.addEventListener('mouseleave', function() { clearTimeout(timer); });
      })();
    </script>
  `,
};
