export function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DarkStream — Account</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #1a1a2e; min-height: 100vh; display: flex; align-items: center; justify-content: center; color: #eee; }
    .card { background: #16213e; border-radius: 16px; padding: 40px; width: 420px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); position: relative; }
    h1 { font-size: 1.4rem; font-weight: 700; margin-bottom: 6px; }
    p { font-size: 0.875rem; color: #9ca3af; margin-bottom: 16px; line-height: 1.5; }
    label { display: block; font-size: 0.8rem; font-weight: 500; color: #9ca3af; margin-bottom: 4px; }
    input[type="email"], input[type="password"] { width: 100%; padding: 10px 12px; border: 1px solid #374151; border-radius: 8px; font-size: 0.9rem; margin-bottom: 12px; background: #0f3460; color: white; outline: none; }
    .captcha { display: flex; align-items: center; gap: 10px; background: #0f3460; border: 1px solid #374151; border-radius: 8px; padding: 14px; margin-bottom: 16px; }
    .captcha input { margin: 0; width: auto; }
    .captcha label { margin: 0; font-size: 0.85rem; color: #d1d5db; }
    .btn { padding: 11px 20px; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: #e94560; color: white; width: 100%; }
    .btn-stay { background: #4f46e5; color: white; flex: 1; font-size: 1rem; padding: 14px; }
    .btn-continue { background: #374151; color: #9ca3af; flex: 1; font-size: 0.8rem; padding: 14px; }
    .btn-confirm { background: #374151; color: #6b7280; font-size: 0.75rem; padding: 8px 14px; float: right; margin-top: 16px; border-radius: 6px; }
    .btn-confirm:hover { background: #4b5563; color: #9ca3af; }
    .step { display: none; }
    .step.active { display: block; }
    .overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 50; align-items: center; justify-content: center; }
    .overlay.active { display: flex; }
    .popup { background: #16213e; border: 1px solid #374151; border-radius: 16px; padding: 36px; max-width: 380px; text-align: center; }
    .popup h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 10px; }
    .popup p { margin-bottom: 24px; }
    .popup-btns { display: flex; gap: 12px; }
    .survey-option { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid #374151; border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: border-color 0.15s; }
    .survey-option:hover { border-color: #6366f1; }
    .survey-option input { accent-color: #6366f1; }
    .pause-box { background: #0f3460; border: 1px solid #4f46e5; border-radius: 12px; padding: 20px; margin-bottom: 16px; text-align: center; }
    .pause-box .price { font-size: 1.5rem; font-weight: 700; color: #818cf8; margin: 6px 0; }
    .btn-pause { background: #4f46e5; color: white; width: 100%; margin-bottom: 10px; }
    .clearfix::after { content: ''; display: table; clear: both; }
  </style>
</head>
<body>

<div class="overlay" id="overlay-retention">
  <div class="popup">
    <div style="font-size:2rem;margin-bottom:8px">😢</div>
    <h2>We'll miss you!</h2>
    <p>Are you sure you want to cancel? You'll lose access to all premium features immediately.</p>
    <div class="popup-btns">
      <button class="btn btn-stay" onclick="closeOverlay('overlay-retention')">Stay with us</button>
      <button class="btn btn-continue" onclick="closeOverlay('overlay-retention'); show('step-survey')">Continue to cancel</button>
    </div>
  </div>
</div>

<div class="card">
  <div id="step-login" class="step active">
    <h1>Sign in to DarkStream</h1>
    <p>Access your account settings.</p>
    <label>Email</label>
    <input type="email" value="user@example.com" />
    <label>Password</label>
    <input type="password" value="password123" />
    <div class="captcha">
      <input type="checkbox" id="captcha-check" />
      <label for="captcha-check">I'm not a robot</label>
      <span style="margin-left:auto;font-size:0.7rem;color:#6b7280">reCAPTCHA</span>
    </div>
    <button class="btn btn-primary" onclick="show('step-account')">Sign in</button>
  </div>

  <div id="step-account" class="step">
    <h1>Account Settings</h1>
    <p>Manage your DarkStream Premium subscription.</p>
    <div style="background:#0f3460;border-radius:10px;padding:16px;margin-bottom:20px;">
      <div style="font-weight:600">DarkStream Premium</div>
      <div style="color:#9ca3af;font-size:0.875rem;margin-top:2px">$29.99 / month</div>
    </div>
    <button class="btn btn-primary" onclick="openOverlay('overlay-retention')">Manage Subscription</button>
  </div>

  <div id="step-survey" class="step">
    <h1>Help us improve</h1>
    <p>Why are you cancelling? (required)</p>
    <div class="survey-option"><input type="radio" name="reason" /> <span>Too expensive</span></div>
    <div class="survey-option"><input type="radio" name="reason" /> <span>Not using it enough</span></div>
    <div class="survey-option"><input type="radio" name="reason" /> <span>Missing features I need</span></div>
    <div class="survey-option"><input type="radio" name="reason" /> <span>Found a better service</span></div>
    <div class="survey-option"><input type="radio" name="reason" /> <span>Technical issues</span></div>
    <div class="clearfix">
      <button class="btn btn-confirm" onclick="show('step-pause')">Next →</button>
    </div>
  </div>

  <div id="step-pause" class="step">
    <h1>Before you go...</h1>
    <p>Would you like to pause instead? Keep your data and settings.</p>
    <div class="pause-box">
      <div style="color:#9ca3af;font-size:0.8rem">Pause for 1 month for just</div>
      <div class="price">$2.99</div>
      <div style="color:#9ca3af;font-size:0.8rem">then back to normal pricing</div>
    </div>
    <button class="btn btn-pause" onclick="closeOverlay('overlay-retention')">Pause my account</button>
    <div class="clearfix">
      <button class="btn btn-confirm" onclick="show('step-confirm')">No thanks, cancel anyway</button>
    </div>
  </div>

  <div id="step-confirm" class="step">
    <h1>Final confirmation</h1>
    <p>By cancelling, you acknowledge that:</p>
    <ul style="font-size:0.8rem;color:#6b7280;margin-bottom:16px;padding-left:18px;line-height:2">
      <li>Your data will be deleted after 30 days</li>
      <li>You will lose all saved content</li>
      <li>Resubscribing may be at a higher price</li>
    </ul>
    <div class="clearfix">
      <button class="btn btn-confirm" id="confirm-cancellation-btn" onclick="show('step-done')">Confirm cancellation</button>
    </div>
  </div>

  <div id="step-done" class="step">
    <div style="text-align:center;font-size:2rem;margin-bottom:12px">✅</div>
    <h1 style="text-align:center">Cancelled</h1>
    <p style="text-align:center;margin-top:8px">Your DarkStream Premium subscription has been cancelled.</p>
  </div>
</div>

<script>
  function show(id) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'))
    document.getElementById(id).classList.add('active')
  }
  function openOverlay(id) { document.getElementById(id).classList.add('active') }
  function closeOverlay(id) { document.getElementById(id).classList.remove('active') }
</script>
</body>
</html>`

  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}
