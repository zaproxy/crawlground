const http = require('http');
const express = require('express');
const path = require('path');
const yaml = require('js-yaml');
const { WebSocketServer } = require('ws');
const { loadRegistry } = require('./lib/registry');
const { store } = require('./lib/store');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const registry = loadRegistry(path.join(__dirname, 'tests'));

app.get('/', (req, res) => {
  res.render('index', { categories: registry.categories, store });
});

app.get('/category/:cat', (req, res) => {
  const tests = registry.byCategory[req.params.cat];
  if (!tests) return res.status(404).send('Unknown category');
  res.render('category', { category: req.params.cat, tests, store });
});

app.get('/test/:cat/:id', (req, res) => {
  const test = registry.byId[`${req.params.cat}.${req.params.id}`];
  if (!test) return res.status(404).send('Unknown test');
  const ctx = { scoreUrl: `/score/${test.category}/${test.localId}`, req };
  const rendered = typeof test.render === 'function' ? test.render(ctx) : test.render;
  let content = '';
  let head = '';
  if (typeof rendered === 'string') {
    content = rendered;
  } else if (rendered && typeof rendered === 'object') {
    content = rendered.html || '';
    head = rendered.head || '';
  }
  if (!head && test.head) {
    head = typeof test.head === 'function' ? test.head(ctx) : test.head;
  }
  res.render('test', { test, content, head });
});

function handleScore(req, res) {
  const test = registry.byId[`${req.params.cat}.${req.params.id}`];
  if (!test) return res.status(404).send('Unknown test');
  if (typeof test.scoreWhen === 'function' && !test.scoreWhen(req)) {
    return res.render('scored', { test, scored: false, reason: 'scoreWhen returned false' });
  }
  store.markScored(test.id);
  res.render('scored', { test, scored: true, reason: null });
}
app.get('/score/:cat/:id', handleScore);
app.post('/score/:cat/:id', handleScore);

// Set the active tool name for multi-tool sessions.
// Not linked from anywhere in the UI — call this before each crawler run.
// POST /set-tool  body: { name: "ZAP Spider" }  (JSON or form-encoded)
// Also accepts ?name=... as a query parameter.
app.post('/set-tool', (req, res) => {
  const name = ((req.body && req.body.name) || req.query.name || '').trim();
  if (!name) return res.status(400).json({ error: 'name is required' });
  store.setCurrentTool(name);
  res.json({ ok: true, tool: store.currentTool });
});

// Used by navigation/06-http-redirect: issues a 302 redirect to the target URL.
app.get('/api/redirect', (req, res) => {
  const url = req.query.url || '/';
  res.redirect(302, url);
});

// Used by frames/03-iframe-src: returns a minimal HTML page containing a link to
// the given URL, so the iframe has a same-origin src rather than inline srcdoc.
app.get('/api/page', (req, res) => {
  const url = req.query.url || '';
  res.send(`<!doctype html><html lang="en"><body><a href="${url}">Click me</a></body></html>`);
});

// Used by the fetch-injected dynamic-content test: echoes back a known score URL
// so the link is only discoverable after a network round-trip.
app.get('/api/reveal', (req, res) => {
  const url = req.query.url || '';
  res.json({ url });
});

// Used by dynamic-content/05-sse-injected: pushes the score URL as a single SSE event.
app.get('/api/sse-reveal', (req, res) => {
  const url = req.query.url || '';
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
  res.flushHeaders();
  const timer = setTimeout(() => {
    res.write(`data: ${JSON.stringify({ url })}\n\n`);
    res.end();
  }, 250);
  req.on('close', () => clearTimeout(timer));
});

app.get('/results', (req, res) => {
  res.render('results', { registry, store });
});

function buildReport(registry, store) {
  const toolEntries = store.allTools();
  const tests = Object.values(registry.byId).map((t) => {
    const tools = {};
    for (const { name, scores } of toolEntries) {
      const e = scores[t.id];
      tools[name] = { scored: !!e, firstHit: e ? e.firstHit : null, hits: e ? e.hits : 0 };
    }
    return { id: t.id, category: t.category, name: t.name, description: t.description, tools };
  });
  const total = tests.length;
  const tools = toolEntries.map(({ name }) => {
    const scored = tests.filter((t) => t.tools[name].scored).length;
    return { name, scored, scoredPercent: total ? Math.round((scored / total) * 100) : 0 };
  });
  const scored = tests.filter((t) => toolEntries.some(({ name }) => t.tools[name].scored)).length;
  return { summary: { total, scored, tools }, tests };
}

app.get('/results.json', (req, res) => {
  res.json(buildReport(registry, store));
});

app.get('/results.yaml', (req, res) => {
  res.type('text/yaml').send(yaml.dump(buildReport(registry, store)));
});

// Normalise a tool name to a camelCase YAML key, e.g. "AJAX Spider" → "ajaxSpider"
function toolNameToKey(name) {
  return name
    .trim()
    .split(/[\s\-_]+/)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('');
}

function buildWebsiteReport(registry, store, req) {
  // Only include tools that have actually scored at least one test
  const toolEntries = store.allTools().filter(({ scores }) => Object.keys(scores).length > 0);
  const allTests = Object.values(registry.byId);
  const total = allTests.length;
  const target = (req.headers['host'] || process.env.CRAWLGROUND_TARGET || 'localhost:3456');
  const section = process.env.CRAWLGROUND_SECTION || 'Crawlground';

  const details = allTests.map((t) => {
    const entry = { path: `/score/${t.category}/${t.localId}`, scheme: 'http' };
    for (const { name, scores } of toolEntries) {
      entry[toolNameToKey(name)] = scores[t.id] ? 'Pass' : 'FAIL';
    }
    return entry;
  });

  const passes = allTests.filter((t) => toolEntries.some(({ scores }) => scores[t.id])).length;
  const fails = total - passes;
  const score = total ? `${Math.round((passes / total) * 100)}%` : '0%';

  const report = { section, target, details, tests: total, passes };
  for (const { name, scores } of toolEntries) {
    report[toolNameToKey(name) + 'Passes'] = allTests.filter((t) => scores[t.id]).length;
  }
  report.fails = fails;
  report.score = score;
  return report;
}

app.get('/website-results.yaml', (req, res) => {
  res.type('text/yaml').send(yaml.dump(buildWebsiteReport(registry, store, req)));
});

app.get('/reset', (req, res) => {
  res.render('reset_confirm');
});
app.post('/reset', (req, res) => {
  if ((req.body && req.body.confirm) !== 'RESET') return res.redirect('/reset');
  store.reset();
  res.redirect('/results');
});

const PORT = process.env.PORT || 3456;
const server = http.createServer(app);

// Used by dynamic-content/06-websocket-injected: accepts a WS connection,
// then pushes the score URL (passed as ?url=) back as a single message.
const wss = new WebSocketServer({ noServer: true });
server.on('upgrade', (req, socket, head) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/api/ws-reveal') {
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  } else {
    socket.destroy();
  }
});
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost').searchParams.get('url') || '';
  const timer = setTimeout(() => {
    ws.send(JSON.stringify({ url }));
    ws.close();
  }, 250);
  ws.on('close', () => clearTimeout(timer));
});

server.listen(PORT, () => {
  console.log(`Crawlground listening on http://localhost:${PORT}`);
  console.log(`Loaded ${Object.keys(registry.byId).length} tests across ${registry.categories.length} categories.`);
});
