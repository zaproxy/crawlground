'use strict';

// Simulates the integrity checks performed by bot-detection systems such as
// Akamai Bot Manager. Three signals are tested 1.5 s after page load (to give
// any extension content scripts time to finish injecting):
//
//   1. chrome-extension:// URLs in document.scripts
//      inject.js and automationBridge.js were appended as <script> elements and
//      left in the DOM permanently before the fix that removes them on onload.
//
//   2. history.pushState.toString() not containing [native code]
//      wrapped pushState/replaceState with a plain function, exposing a
//      non-native toString before the Proxy-based wrapping fix.
//
// The link to the marker URL is injected only when all three checks pass.

module.exports = {
  name: 'Bot-detection globals check',
  description:
    'Simulates an Akamai Bot Manager-style check. JavaScript waits 1.5 s after ' +
    'page load, then tests two signals: (1) chrome-extension:// URLs in document.scripts, ' +
	'(2) history.pushState.toString() lacking [native code]. ' +
    'The link to the marker URL is only injected when all three pass.',

  render({ scoreUrl }) {
    const safeUrl = JSON.stringify(scoreUrl);
    return `\
<p id="ptk-status">Checking browser environment&hellip;</p>
<div id="ptk-result"></div>
<script>
(function () {
  function runChecks() {
    var reasons = [];

    // 1. Extension-origin script elements left in document.scripts
    var extScripts = Array.from(document.scripts).filter(function (s) {
      return s.src.startsWith('chrome-extension://');
    });
    if (extScripts.length > 0) {
      reasons.push(extScripts.length + ' chrome-extension:// script(s) found in document.scripts');
    }

    // 2. history.pushState must still look native
    try {
      var fnStr = Function.prototype.toString.call(history.pushState);
      if (fnStr.indexOf('[native code]') === -1) {
        reasons.push('history.pushState.toString() does not contain [native code]');
      }
    } catch (_) {
      reasons.push('history.pushState.toString() threw an exception');
    }

    var statusEl = document.getElementById('ptk-status');
    var resultEl = document.getElementById('ptk-result');

    if (reasons.length === 0) {
      statusEl.textContent = 'Environment clean — no automation artifacts detected.';
      var a = document.createElement('a');
      a.href = ${safeUrl};
      a.textContent = 'Continue to score';
      resultEl.appendChild(a);
    } else {
      statusEl.textContent = 'Automation artifacts detected — link withheld:';
      var ul = document.createElement('ul');
      reasons.forEach(function (r) {
        var li = document.createElement('li');
        li.textContent = r;
        ul.appendChild(li);
      });
      resultEl.appendChild(ul);
    }
  }

  // Allow extension content scripts up to 1.5 s to finish injecting before
  // we read the environment, so the check reflects stable post-load state.
  if (document.readyState === 'complete') {
    setTimeout(runChecks, 1500);
  } else {
    window.addEventListener('load', function () { setTimeout(runChecks, 1500); });
  }
}());
</script>`;
  },
};
