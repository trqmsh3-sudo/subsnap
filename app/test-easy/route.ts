export function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EasyStream — Account</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #f3f4f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: white; border-radius: 16px; padding: 40px; width: 380px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    h1 { font-size: 1.4rem; font-weight: 700; margin-bottom: 6px; color: #111; }
    p { font-size: 0.875rem; color: #6b7280; margin-bottom: 20px; }
    .btn { width: 100%; padding: 11px; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
    .btn:hover { opacity: 0.85; }
    .btn-danger { background: #ef4444; color: white; }
    .plan-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
    .plan-name { font-weight: 600; color: #111; }
    .plan-price { color: #6b7280; font-size: 0.875rem; margin-top: 2px; }
    .step { display: none; }
    .step.active { display: block; }
    .success-icon { font-size: 2.5rem; text-align: center; margin-bottom: 12px; }
    .badge { display: inline-block; background: #dbeafe; color: #1d4ed8; font-size: 0.75rem; font-weight: 600; padding: 2px 10px; border-radius: 999px; margin-bottom: 14px; }
  </style>
</head>
<body>
<div class="card">
  <div id="step-account" class="step active">
    <span class="badge">Active</span>
    <h1>My Account</h1>
    <p>You're currently subscribed to EasyStream Plus.</p>
    <div class="plan-box">
      <div class="plan-name">EasyStream Plus</div>
      <div class="plan-price">$9.99 / month · Renews May 1, 2026</div>
    </div>
    <button class="btn btn-danger" id="cancel-subscription-btn" onclick="show('step-done')">Cancel Subscription</button>
  </div>
  <div id="step-done" class="step">
    <div class="success-icon">✅</div>
    <h1 style="text-align:center">Subscription Cancelled</h1>
    <p style="text-align:center;margin-top:8px">Your EasyStream Plus plan has been cancelled. Access continues until May 1, 2026.</p>
  </div>
</div>
<script>
  function show(id) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'))
    document.getElementById(id).classList.add('active')
  }
</script>
</body>
</html>`

  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}
