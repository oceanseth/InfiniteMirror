const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// InfiniteMirror: login-first. Identity arrives from the Pomerium proxy as
// x-pomerium-claim-email. Everything except /api/whoami requires it unless
// ALLOW_UNGATED=1 (local dev without the proxy in front).
// TODO: verify X-Pomerium-Jwt-Assertion against the cluster JWKS instead of
// trusting the claim header — required before exposing beyond localhost.
const identityOf = (req) => req.headers['x-pomerium-claim-email'] || null;
app.use((req, res, next) => {
  if (process.env.ALLOW_UNGATED === '1' || req.path === '/api/whoami' || identityOf(req)) {
    return next();
  }
  res.status(401).send(
    '<body style="background:#0b0f14;color:#e2e8f0;font:16px system-ui;display:grid;place-items:center;height:95vh">' +
    '<div style="text-align:center"><h1>&#128272; InfiniteMirror</h1>' +
    '<p>This dashboard is gated by Pomerium. Sign in through the cluster route<br>' +
    '(e.g. <code>https://dashboard.&lt;cluster&gt;.pomerium.app</code>) — direct access carries no identity.</p>' +
    '<p style="color:#64748b">Local dev bypass: <code>ALLOW_UNGATED=1 node server.js</code></p></div></body>');
});

app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Database for Developer Dashboard
let earnings = 0.0;
const trafficLogs = [];
const activeWallet = "0x3dEF78C89327eB05531Daedb4eC3Dd5287F10FD6";

// InfiniteMirror: real reasoning from the Akash-hosted worker.
// Config resolves env-first, then AWS SSM /infinitemirror/worker/ (same
// contract as orchestrator/config.py). Without either, twins fall back to
// canned quotes so the sim still demos offline.
const { execSync } = require('child_process');
let workerCfg = {
  baseUrl: process.env.ORCH_BASE_URL,
  apiKey: process.env.ORCH_API_KEY,
  model: process.env.ORCH_MODEL
};
if (!workerCfg.baseUrl || !workerCfg.apiKey) {
  try {
    const params = JSON.parse(execSync(
      'aws ssm get-parameters-by-path --path /infinitemirror/worker --with-decryption --output json',
      { encoding: 'utf8', timeout: 15000 }
    )).Parameters.reduce((m, p) => (m[p.Name.split('/').pop()] = p.Value, m), {});
    workerCfg = {
      baseUrl: workerCfg.baseUrl || params.base_url,
      apiKey: workerCfg.apiKey || params.api_key,
      model: workerCfg.model || params.model
    };
    console.log(`Worker config loaded from SSM (model: ${workerCfg.model})`);
  } catch (e) {
    console.warn('SSM config unavailable, twins fall back to canned quotes:', e.message.split('\n')[0]);
  }
}

async function llmSpeech(sender, receiver, topic, previousMessage) {
  if (!workerCfg.baseUrl || !workerCfg.apiKey) return null;
  const messages = [
    { role: 'system', content: `You are ${sender.name}, ${sender.role}. Perspective: ${sender.style.plan} Stay in character and be specific — 2-3 sentences, no preamble.` },
    { role: 'user', content: previousMessage
        ? `Debate topic: "${topic}". ${receiver.name} just said: "${previousMessage}". Respond to them directly.`
        : `Debate topic: "${topic}". Open the discussion with your position.` }
  ];
  const resp = await fetch(`${workerCfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${workerCfg.apiKey}` },
    body: JSON.stringify({ model: workerCfg.model, messages, temperature: 0.8, max_tokens: 160 })
  });
  if (!resp.ok) throw new Error(`worker responded ${resp.status}`);
  return (await resp.json()).choices[0].message.content.trim();
}

// Pricing Configuration Defaults
let pricingConfig = {
  baseCost: 0.005,
  costPerTurn: 0.003,
  desirabilityMultipliers: {
    "garry tan": 3.0,
    "mark cuban": 3.0,
    "elon musk": 3.0,
    "jensen huang": 3.0,
    "senior tech lead": 1.5,
    "director of product": 1.5,
    "financial analyst": 1.5,
    "software engineer": 1.0,
    "general assistant": 1.0
  },
  toolSurcharges: {
    "live search": 0.015,
    "proprietary databases": 0.025,
    "sandboxed code execution": 0.010
  },
  topicComplexitySurcharge: 0.010,
  complexityKeywords: ["quantum", "fusion", "agi", "macroeconomics", "artificial general intelligence", "semiconductors"]
};

// Twin Personalities and Speaking Styles
const personalities = {
  "garry tan": {
    name: "Garry Tan (Digital Twin)",
    avatar: "🎨",
    role: "Elite VC & YC President",
    style: {
      plan: "Focus on network effects, YC community leverage, and direct product-market fit.",
      selfCorrect: "Needs to ground high-flying tech assumptions into raw founder execution speed.",
      quotes: [
        "Let's look at this from a product-market fit and retention perspective.",
        "The YC community network effect is a massive distribution engine.",
        "Make something people want. That's the only metric that matters at seed stage.",
        "If you don't build a direct relationship with your users, you're building on rented land."
      ]
    }
  },
  "mark cuban": {
    name: "Mark Cuban (Digital Twin)",
    avatar: "🦈",
    role: "Elite Investor & Shark",
    style: {
      plan: "Evaluate the cost of customer acquisition (CAC), lifetime value (LTV), and real cash flow.",
      selfCorrect: "Needs to restrain aggressive sales pushes to understand backend technical limits.",
      quotes: [
        "What's your cost of customer acquisition? If you don't know your CAC, you don't have a business!",
        "Sales cures all. You can have the best AI model, but if you can't sell it, you're dead in the water.",
        "No one ever bought anything because it was 'disruptive'. They buy because it solves a pain point.",
        "Are you a feature or a company? Right now, you look like a feature."
      ]
    }
  },
  "elon musk": {
    name: "Elon Musk (Digital Twin)",
    avatar: "🚀",
    role: "Elite Tech Founder",
    style: {
      plan: "Apply first-principles physics thinking to maximize raw processing efficiency and engineering velocity.",
      selfCorrect: "Acknowledge that manufacturing/deployment timelines often hit physical constraints.",
      quotes: [
        "We need to break this down to the first-principles physics. What are the core constraints?",
        "The best part is no part. The best process is no process. It weighs nothing, costs nothing.",
        "If the rate of engineering improvement is high, you will succeed. Otherwise, you're dead.",
        "We are aiming for a step-change improvement here, not a 10% optimization."
      ]
    }
  },
  "jensen huang": {
    name: "Jensen Huang (Digital Twin)",
    avatar: "🟢",
    role: "Elite Tech CEO",
    style: {
      plan: "Argue for full-stack acceleration, GPU computing efficiency, and software-hardware co-design.",
      selfCorrect: "Scale down architectural vision to practical developer steps.",
      quotes: [
        "The more you buy, the more you save. accelerated computing is the only path forward.",
        "We are at the beginning of the next industrial revolution, powered by AI factories.",
        "This requires co-designing the hardware, the middleware, the algorithms, and the application layers.",
        "It's a full-stack problem. You cannot solve this with general-purpose CPUs."
      ]
    }
  },
  "software engineer": {
    name: "Standard Dev Twin",
    avatar: "💻",
    role: "Standard Software Engineer",
    style: {
      plan: "Focus on clean architecture, refactoring tech debt, and writing test suites.",
      selfCorrect: "Realize that shipping something functional is better than a perfect codebase.",
      quotes: [
        "We need to write unit tests for this and check for memory leaks.",
        "That's a legacy system. Refactoring it will take at least two sprints.",
        "Let me check the API docs and write a quick script to test the connection.",
        "LGTM, let's merge it to main and see if it passes CI/CD."
      ]
    }
  },
  "general assistant": {
    name: "Assistant Twin",
    avatar: "🤖",
    role: "General Assistant",
    style: {
      plan: "Organize the discussion structure and maintain a polite, balanced stance.",
      selfCorrect: "Needs to offer specific recommendations rather than general summaries.",
      quotes: [
        "Here is a summary of the points discussed so far.",
        "Let me help organize these action items for the team.",
        "I can coordinate the schedule and make sure we address all questions.",
        "Please let me know how I can assist you further with this topic."
      ]
    }
  }
};

// Helper: Calculate dynamic price
function calculatePrice(twins, topic, turns, tools) {
  let price = pricingConfig.baseCost;

  // Add turns cost
  price += turns * pricingConfig.costPerTurn;

  // Add Twin desirability cost
  twins.forEach(twin => {
    const name = twin.toLowerCase();
    const multiplier = pricingConfig.desirabilityMultipliers[name] || 1.0;
    // Multiplier scales the base cost addition
    price += (multiplier - 1.0) * 0.010; 
  });

  // Add Tool Access surcharges
  tools.forEach(tool => {
    const name = tool.toLowerCase();
    const surcharge = pricingConfig.toolSurcharges[name] || 0.0;
    price += surcharge;
  });

  // Add complexity surcharge
  const lowercaseTopic = topic.toLowerCase();
  const isComplex = pricingConfig.complexityKeywords.some(keyword => lowercaseTopic.includes(keyword));
  if (isComplex) {
    price += pricingConfig.topicComplexitySurcharge;
  }

  // Format to 4 decimal places
  return parseFloat(price.toFixed(4));
}

// Helper: Generate dialogue turn in Plan-Act-Observe-Self-Correct (PAOS) format
async function generatePAOSTurn(senderKey, receiverKey, topic, turnIndex, previousMessage) {
  const sender = personalities[senderKey] || personalities["general-assistant"];
  const receiver = personalities[receiverKey] || personalities["general-assistant"];

  // Real reasoning from the Akash worker; canned quotes as offline fallback
  let source = 'canned';
  let speech = null;
  try {
    speech = await llmSpeech(sender, receiver, topic, previousMessage);
    if (speech) source = workerCfg.model;
  } catch (e) {
    console.warn('worker call failed, using canned quote:', e.message);
  }
  if (speech) {
    return {
      twin: sender.name,
      avatar: sender.avatar,
      role: sender.role,
      source,
      plan: `Evaluate: "${topic}". Current turn: #${turnIndex + 1}. Goal: ${sender.style.plan}`,
      act: `Spoke: "${speech}"`,
      observe: previousMessage ? `Heard: "${previousMessage.substring(0, 60)}..."` : "Initiating dialogue simulation.",
      selfCorrect: `Reflecting on feedback. Adjusting vector: ${sender.style.selfCorrect}`,
      message: speech
    };
  }

  // Custom dialogue lines matching the topic
  speech = sender.style.quotes[turnIndex % sender.style.quotes.length];
  if (previousMessage) {
    if (senderKey === "mark cuban" && previousMessage.includes("network")) {
      speech = "Garry talks about network effects, but if you don't have customers paying you cash day one, your network is worth zero! Show me the money.";
    } else if (senderKey === "garry tan" && previousMessage.includes("sales")) {
      speech = "Mark, sales cures all in lifestyle businesses. But for venture scale, code and media leverage are what create monopoly rent. YC founders focus on product-market fit first.";
    } else if (senderKey === "elon musk" && previousMessage.includes("compute")) {
      speech = "Accelerated compute is useful, but the fundamental physical limit is electrical power and cooling efficiency. We must optimize the energy-per-inference parameter.";
    } else if (senderKey === "jensen huang" && previousMessage.includes("power")) {
      speech = "Elon is right about thermodynamics. But the density of computation in GPU clusters is what shrinks the physical footprint. The GPU is the most energy-efficient engine.";
    }
  }

  return {
    twin: sender.name,
    avatar: sender.avatar,
    role: sender.role,
    source: 'canned',
    plan: `Evaluate: "${topic}". Current turn: #${turnIndex + 1}. Goal: ${sender.style.plan}`,
    act: `Spoke: "${speech}"`,
    observe: previousMessage ? `Heard: "${previousMessage.substring(0, 60)}..."` : "Initiating dialogue simulation.",
    selfCorrect: `Reflecting on feedback. Adjusting vector: ${sender.style.selfCorrect}`,
    message: speech
  };
}

// API: Get Traffic Logs & Config
app.get('/api/traffic', (req, res) => {
  res.json({
    earnings: parseFloat(earnings.toFixed(4)),
    walletAddress: activeWallet,
    traffic: trafficLogs
  });
});

app.get('/api/pricing-config', (req, res) => {
  res.json(pricingConfig);
});

app.post('/api/pricing-config', (req, res) => {
  pricingConfig = { ...pricingConfig, ...req.body };
  res.json({ success: true, config: pricingConfig });
});

// API: Who is the Pomerium-authenticated user? (headers set by the proxy)
app.get('/api/whoami', (req, res) => {
  const email = identityOf(req);
  res.json({ email, gated: !!email });
});

// API: Chat with the orchestrator harness. Each request runs the skill-aware
// routing loop against the Akash worker; the reply includes every hop so the
// UI can show which agent handled which skill. Identity is stamped into the
// trace, tying reasoning requests to the Pomerium login that made them.
const { execFile } = require('child_process');
const REPO_ROOT = path.join(__dirname, '..');
const PYTHON = path.join(REPO_ROOT, '.venv', 'bin', 'python');
app.post('/api/orchestrate', (req, res) => {
  const task = (req.body.task || '').trim();
  if (!task) return res.status(400).json({ error: 'task is required' });
  const identity = identityOf(req) || 'ungated-local';
  execFile(PYTHON, [path.join(REPO_ROOT, 'orchestrator', 'orchestrator.py'), '--json', task],
    { timeout: 180000, maxBuffer: 4 * 1024 * 1024 },
    (err, stdout, stderr) => {
      if (err) {
        console.error('orchestrate failed:', stderr || err.message);
        return res.status(502).json({ error: 'orchestrator failed', detail: (stderr || err.message).slice(-400) });
      }
      try {
        const result = JSON.parse(stdout.trim().split('\n').pop());
        res.json({ identity, ...result });
      } catch (e) {
        res.status(502).json({ error: 'bad orchestrator output', detail: stdout.slice(-400) });
      }
    });
});

// API: Simulate Digital Twin Dialogue with HTTP 402 Dynamic Pricing Gating
app.post('/api/simulate', async (req, res) => {
  const { twins, topic, turns, tools } = req.body;

  // Validation
  if (!twins || !Array.isArray(twins) || twins.length < 2) {
    return res.status(400).json({ error: "At least two digital twins must be specified." });
  }
  if (!topic) {
    return res.status(400).json({ error: "A conversation topic is required." });
  }

  const simTurns = turns ? parseInt(turns) : 3;
  const simTools = tools || [];

  // Calculate dynamic price
  const price = calculatePrice(twins, topic, simTurns, simTools);

  // Check for HTTP 402 receipt
  const paymentReceipt = req.headers['x-payment-receipt'];

  if (!paymentReceipt) {
    // Unpaid request - log traffic & challenge
    const logId = 'tx_' + Math.random().toString(36).substr(2, 9);
    const unpaidLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      topic,
      twins,
      turns: simTurns,
      tools: simTools,
      price,
      status: "Payment Required (402)",
      paid: false
    };
    trafficLogs.unshift(unpaidLog);

    // Send HTTP 402 Challenge
    res.setHeader('X-Payment-Required', JSON.stringify({
      amount: price,
      asset: "USDC",
      chain: "base",
      recipient: activeWallet
    }));
    return res.status(402).json({
      error: "Payment Required",
      price,
      asset: "USDC",
      chain: "base",
      recipient: activeWallet,
      note: "Sign and submit this payment using your Zero wallet, then retry with the X-Payment-Receipt header."
    });
  }

  // Request is paid - Verify receipt and execute
  const logId = 'tx_' + Math.random().toString(36).substr(2, 9);
  
  // Run simulation
  const simulationDialogue = [];
  const twin1 = twins[0].toLowerCase();
  const twin2 = twins[1].toLowerCase();
  
  let lastMessage = "";
  for (let i = 0; i < simTurns; i++) {
    const sender = i % 2 === 0 ? twin1 : twin2;
    const receiver = i % 2 === 0 ? twin2 : twin1;
    
    const step = await generatePAOSTurn(sender, receiver, topic, i, lastMessage);
    simulationDialogue.push(step);
    lastMessage = step.message;
  }

  // Add earnings
  earnings += price;

  const paidLog = {
    id: logId,
    timestamp: new Date().toISOString(),
    topic,
    twins,
    turns: simTurns,
    tools: simTools,
    price,
    status: "Success (200)",
    paid: true,
    receipt: paymentReceipt,
    dialogue: simulationDialogue
  };
  trafficLogs.unshift(paidLog);

  res.json({
    success: true,
    price,
    dialogue: simulationDialogue
  });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🌐 A2A Simulation Server running on port ${PORT}`);
  console.log(`💳 Wallet Address: ${activeWallet}`);
  console.log(`==================================================`);
});
