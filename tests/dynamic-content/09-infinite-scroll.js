module.exports = {
  name: 'Infinite scroll — link in auto-loaded batch',
  description: 'A scroll event listener fires when the user reaches the bottom of the page and automatically appends the next batch of items, which contains the score link. No button click is needed — the crawler must scroll to the bottom of the page.',
  render: ({ scoreUrl }) => {
    const items = Array.from({ length: 15 }, (_, i) => `<li style="padding:8px;border-bottom:1px solid #eee">Item ${i + 1}</li>`).join('\n      ');
    return `
    <ul id="items" style="list-style:none;margin:0;padding:0">
      ${items}
    </ul>
    <div id="scroll-slot"></div>
    <script>
      (function() {
        var scoreUrl = ${JSON.stringify(scoreUrl)};
        var loaded = false;
        function checkScroll() {
          if (loaded) return;
          if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 100) {
            loaded = true;
            window.removeEventListener('scroll', checkScroll);
            var list = document.getElementById('items');
            for (var i = 16; i <= 20; i++) {
              var li = document.createElement('li');
              li.style.cssText = 'padding:8px;border-bottom:1px solid #eee';
              li.textContent = 'Item ' + i;
              list.appendChild(li);
            }
            var li = document.createElement('li');
            li.style.cssText = 'padding:8px';
            var a = document.createElement('a');
            a.href = scoreUrl;
            a.textContent = 'Item 21 — click me';
            li.appendChild(a);
            list.appendChild(li);
          }
        }
        window.addEventListener('scroll', checkScroll);
        checkScroll();
      })();
    </script>
    `;
  },
};
