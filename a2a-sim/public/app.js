// Global State
let activePayload = null;
let activeReceipt = null;

// Initialize Dashboard on Load
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  
  // Set polling for updates
  setInterval(loadDashboard, 3000);

  // Setup Config Rules form handler
  document.getElementById('config-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const config = {
      baseCost: parseFloat(document.getElementById('baseCost').value),
      costPerTurn: parseFloat(document.getElementById('costPerTurn').value)
    };

    try {
      const res = await fetch('/api/pricing-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        showToast("Rules updated successfully!");
      }
    } catch (err) {
      console.error("Failed to update config:", err);
    }
  });
});

// Load statistics, config, and transactions
async function loadDashboard() {
  try {
    const res = await fetch('/api/traffic');
    const data = await res.json();
    
    // Update dashboard stats
    document.getElementById('earnings-value').innerHTML = `$${data.earnings.toFixed(4)} <span class="currency">USDC</span>`;
    document.getElementById('merchant-wallet').innerText = shortenWallet(data.walletAddress);

    // Populate transaction logs
    const listElement = document.getElementById('traffic-log-list');
    
    // Remember currently selected transaction to keep it highlighted
    const selectedId = listElement.querySelector('.traffic-row.selected')?.dataset.id;
    listElement.innerHTML = '';

    if (data.traffic.length === 0) {
      listElement.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No transactions yet</div>';
      return;
    }

    data.traffic.forEach(tx => {
      const row = document.createElement('div');
      row.className = `traffic-row ${tx.id === selectedId ? 'selected' : ''}`;
      row.dataset.id = tx.id;
      row.onclick = () => selectTransaction(tx);

      const time = new Date(tx.timestamp).toLocaleTimeString();
      const twinsDesc = `${tx.twins[0]} vs ${tx.twins[1]}`;
      const statusClass = tx.paid ? 'status-200' : 'status-402';
      const statusText = tx.paid ? '200 OK' : '402 Payment';

      row.innerHTML = `
        <span class="traffic-time">${time}</span>
        <span class="traffic-desc" title="${tx.topic}"><strong>${twinsDesc}</strong>: ${tx.topic}</span>
        <span class="traffic-price">$${tx.price.toFixed(4)}</span>
        <div><span class="status-badge-api ${statusClass}">${statusText}</span></div>
      `;
      listElement.appendChild(row);
    });

  } catch (err) {
    console.error("Failed to load dashboard data:", err);
  }
}

// Select and show dialogue from log list
function selectTransaction(tx) {
  // Highlight row
  document.querySelectorAll('.traffic-row').forEach(row => row.classList.remove('selected'));
  const activeRow = document.querySelector(`.traffic-row[data-id="${tx.id}"]`);
  if (activeRow) activeRow.classList.add('selected');

  // Display details
  const badge = document.getElementById('sim-active-badge');
  const topicBox = document.getElementById('player-topic-box');
  const timeline = document.getElementById('dialogue-timeline');

  topicBox.innerText = `Topic: "${tx.topic}"`;

  if (!tx.paid) {
    badge.innerText = "Payment Required";
    badge.className = "active-badge";
    timeline.innerHTML = `
      <div style="padding: 2rem 1rem; text-align: center; color: var(--accent-amber); font-size: 0.85rem; background: rgba(245, 158, 11, 0.05); border: 1px dashed rgba(245, 158, 11, 0.2); border-radius: 12px;">
        ⚠️ This API call was blocked with HTTP 402. No simulation records are available. Settle payment to run.
      </div>
    `;
    return;
  }

  badge.innerText = "Active Dialogue";
  badge.className = "active-badge active";
  renderTimeline(tx.dialogue);
}

// Render PAOS turns in player timeline
function renderTimeline(dialogue) {
  const timeline = document.getElementById('dialogue-timeline');
  timeline.innerHTML = '';

  dialogue.forEach((turn, idx) => {
    const step = document.createElement('div');
    step.className = 'timeline-step';
    step.style.animationDelay = `${idx * 0.15}s`;

    step.innerHTML = `
      <div class="step-header">
        <span class="step-avatar">${turn.avatar}</span>
        <div class="step-meta">
          <strong>${turn.twin}</strong>
          <span>${turn.role}</span>
        </div>
      </div>
      <div class="step-loops">
        <div class="loop-state">
          <span class="state-lbl lbl-plan">Plan</span>
          <span class="state-val">${turn.plan}</span>
        </div>
        <div class="loop-state">
          <span class="state-lbl lbl-act">Act</span>
          <span class="state-val">${turn.act}</span>
        </div>
        <div class="loop-state">
          <span class="state-lbl lbl-observe">Observe</span>
          <span class="state-val">${turn.observe}</span>
        </div>
        <div class="loop-state">
          <span class="state-lbl lbl-correct">Correct</span>
          <span class="state-val">${turn.selfCorrect}</span>
        </div>
      </div>
      <div class="step-bubble">
        "${turn.message}"
      </div>
    `;
    timeline.appendChild(step);
  });
}

// Trigger POST simulation request simulating the client flow
async function triggerSimulateRequest() {
  const twinA = document.getElementById('twin-select-1').value;
  const twinB = document.getElementById('twin-select-2').value;
  
  if (twinA === twinB) {
    alert("Please select two different digital twins to simulate conversation.");
    return;
  }

  const topic = document.getElementById('topic-input').value;
  const turns = parseInt(document.getElementById('turns-input').value);
  
  // Gather tools
  const tools = [];
  document.querySelectorAll('input[name="tools"]:checked').forEach(cb => {
    tools.push(cb.value);
  });

  activePayload = {
    twins: [twinA, twinB],
    topic,
    turns,
    tools
  };

  // Attempt API request without payment headers
  try {
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activePayload)
    });

    if (res.status === 402) {
      // Caught the HTTP 402 challenge!
      const errorData = await res.json();
      showPaymentModal(errorData);
    } else {
      const data = await res.json();
      renderDialogueOutput(data);
    }
  } catch (err) {
    console.error("Simulation failed:", err);
  }
}

// Show Zero Payment Approval modal
function showPaymentModal(challenge) {
  const modal = document.getElementById('payment-modal');
  document.getElementById('modal-price').innerText = `${challenge.price.toFixed(4)} USDC`;
  document.getElementById('modal-recipient').innerText = shortenWallet(challenge.recipient);
  modal.classList.add('active');
}

// Decline Payment Modal Action
function declinePayment() {
  document.getElementById('payment-modal').classList.remove('active');
  loadDashboard(); // Refresh traffic log to show the 402 row
}

// Settle Payment and Retry API Call
async function approvePayment() {
  document.getElementById('payment-modal').classList.remove('active');
  showToast("Settling payment via Zero wallet...");

  // Generate a mock payment receipt hash
  activeReceipt = 'rcpt_' + Math.random().toString(36).substr(2, 16);

  // Retry the request with the receipt attached
  try {
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Payment-Receipt': activeReceipt
      },
      body: JSON.stringify(activePayload)
    });

    if (res.ok) {
      const data = await res.json();
      showToast("✨ Payment verified. Running simulation!");
      renderDialogueOutput(data);
    } else {
      showToast("❌ Payment verification failed.");
    }
  } catch (err) {
    console.error("Payment retry failed:", err);
  }
  
  loadDashboard();
}

// Output simulation details to Player column
function renderDialogueOutput(data) {
  const badge = document.getElementById('sim-active-badge');
  const topicBox = document.getElementById('player-topic-box');
  
  badge.innerText = "Active Dialogue";
  badge.className = "active-badge active";
  topicBox.innerText = `Topic: "${activePayload.topic}"`;

  renderTimeline(data.dialogue);
}

// Helper: Shorten wallet format
function shortenWallet(addr) {
  if (!addr) return "";
  return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
}

// Helper: Show brief UI Toast status
function showToast(message) {
  let toast = document.getElementById('ui-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ui-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: rgba(10, 12, 24, 0.95);
      border: 1px solid var(--accent-indigo);
      border-radius: 8px;
      padding: 0.75rem 1.25rem;
      font-size: 0.8rem;
      color: #fff;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      z-index: 2000;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.style.opacity = 1;
  setTimeout(() => {
    toast.style.opacity = 0;
  }, 3000);
}
