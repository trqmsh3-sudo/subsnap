export function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Test Cancel Flow</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #f9fafb; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 40px; width: 380px; }
    h1 { font-size: 1.4rem; font-weight: 700; margin-bottom: 6px; }
    p { font-size: 0.875rem; color: #6b7280; margin-bottom: 24px; }
    label { display: block; font-size: 0.8rem; font-weight: 500; color: #374151; margin-bottom: 4px; }
    input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; margin-bottom: 16px; outline: none; }
    input:focus { border-color: #6366f1; }
    button { width: 100%; padding: 11px; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    button:hover { opacity: 0.85; }
    .btn-primary { background: #6366f1; color: white; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-ghost { background: #f3f4f6; color: #374151; margin-top: 8px; }
    .step { display: none; }
    .step.active { display: block; }
    .badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 0.75rem; font-weight: 600; padding: 2px 10px; border-radius: 999px; margin-bottom: 16px; }
    .plan-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
    .plan-box .name { font-weight: 600; font-size: 1rem; }
    .plan-box .price { color: #6b7280; font-size: 0.875rem; margin-top: 2px; }
    .success-icon { font-size: 2.5rem; text-align: center; margin-bottom: 12px; }
    .success-title { font-size: 1.2rem; font-weight: 700; text-align: center; margin-bottom: 6px; }
    .success-msg { text-align: center; color: #6b7280; font-size: 0.875rem; }
  </style>
</head>
<body>
<div class="card">
  <div id="step-login" class="step active">
    <h1>Sign in</h1>
    <p>Enter your credentials to manage your subscription.</p>
    <label>Email</label>
    <input id="email" type="email" placeholder="you@example.com" value="test@example.com" />
    <label>Password</label>
    <input id="password" type="password" placeholder="••••••••" value="password123" />
    <button class="btn-primary" onclick="goToStep('step-manage')">Sign in</button>
  </div>
  <div id="step-manage" class="step">
    <span class="badge">Active Plan</span>
    <h1>Manage Subscription</h1>
    <p>You are currently on the Premium plan.</p>
    <div class="plan-box">
      <div class="name">Premium Monthly</div>
      <div class="price">$14.99 / month · Renews Jan 1, 2027</div>
    </div>
    <button class="btn-danger" onclick="goToStep('step-confirm')">Cancel subscription</button>
    <button class="btn-ghost" onclick="goToStep('step-login')">Back</button>
  </div>
  <div id="step-confirm" class="step">
    <h1>Are you sure?</h1>
    <p>You'll lose access to Premium features at the end of your billing period.</p>
    <div class="plan-box">
      <div class="name">Cancellation effective</div>
      <div class="price">Dec 31, 2026 — no further charges</div>
    </div>
    <button class="btn-danger" id="confirm-cancel-btn" onclick="goToStep('step-done')">Yes, cancel my subscription</button>
    <button class="btn-ghost" onclick="goToStep('step-manage')">Keep my plan</button>
  </div>
  <div id="step-done" class="step">
    <div class="success-icon">✅</div>
    <div class="success-title">Subscription cancelled</div>
    <p class="success-msg">Your Premium plan has been cancelled. You'll have access until Dec 31, 2026.</p>
  </div>
</div>
<script>
  function goToStep(id) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'))
    document.getElementById(id).classList.add('active')
  }
</script>
</body>
</html>`

  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}
