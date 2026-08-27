const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. Generate 128x128 Icon
  await page.setViewportSize({ width: 128, height: 128 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 128px;
          height: 128px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
        }
        .box {
          width: 112px;
          height: 112px;
          border-radius: 28px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(5, 150, 105, 0.35);
        }
        svg {
          width: 64px;
          height: 64px;
          stroke: #ffffff;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19.439 7.85c0-1.571-1.285-2.85-2.87-2.85h-2.14a2.85 2.85 0 0 0-5.7 0H6.589c-1.585 0-2.87 1.279-2.87 2.85v2.14a2.85 2.85 0 0 0 0 5.7v2.14c0 1.571 1.285 2.85 2.87 2.85h2.14a2.85 2.85 0 0 1 5.7 0h2.14c1.585 0 2.87-1.279 2.87-2.85v-2.14a2.85 2.85 0 0 1 0-5.7v-2.14z"/>
        </svg>
      </div>
    </body>
    </html>
  `);
  await page.screenshot({ path: path.join(__dirname, '../public/store-icon-128.png') });
  await page.screenshot({ path: path.join(__dirname, '../extension/icons/icon128.png') });

  // 2. Generate 1280x800 Screenshot 1: Popup & Smart Auto-Pilot
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body {
          width: 1280px;
          height: 800px;
          background: #fafafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .header {
          text-align: center;
          margin-bottom: 24px;
        }
        .badge {
          display: inline-block;
          padding: 6px 14px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 999px;
          color: #059669;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        h1 {
          font-size: 42px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.03em;
        }
        h1 span {
          color: #059669;
        }
        p {
          font-size: 16px;
          color: #64748b;
          font-weight: 500;
          margin-top: 6px;
        }
        .mockup {
          width: 400px;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.15), 0 0 30px rgba(5, 150, 105, 0.08);
          padding: 20px;
        }
        .mockup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 14px;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
        }
        .logo-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .input-box {
          background: #f8fafc;
          border: 1.5px solid #059669;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .result {
          background: #ffffff;
          border: 1.5px solid #10b981;
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 14px;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.12);
        }
        .btn-cancel {
          width: 100%;
          background: #0f172a;
          color: white;
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          text-align: center;
          margin-top: 10px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .grid-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          justify-content: space-between;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="badge">Official Chrome Extension</div>
        <h1>1-Click Cancel for <span>Any Subscription</span></h1>
        <p>Zero password friction. Operates directly in your active browser session.</p>
      </div>

      <div class="mockup">
        <div class="mockup-header">
          <div class="logo">
            <div class="logo-icon">🧩</div>
            <span>SubSnap</span>
          </div>
          <span style="font-size: 11px; font-weight: 800; color: #059669; background: #ecfdf5; padding: 3px 8px; border-radius: 999px; border: 1px solid #a7f3d0;">👑 PRO</span>
        </div>

        <div class="input-box">
          <span>🔍</span>
          <span>Netflix Premium Plan</span>
        </div>

        <div class="result">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 14px; color: #0f172a;">Netflix</strong>
            <span style="font-size: 10px; font-weight: 800; color: #059669; background: #ecfdf5; padding: 2px 6px; border-radius: 6px;">Direct Pathway</span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Direct 1-click cancellation confirmation page located.</div>
          <div class="btn-cancel">Launch 3-Second Auto-Pilot ➔</div>
        </div>

        <div class="grid">
          <div class="grid-item"><span>Claude Pro</span> <span style="color: #059669;">Auto</span></div>
          <div class="grid-item"><span>Adobe CC</span> <span style="color: #059669;">Auto</span></div>
          <div class="grid-item"><span>Spotify</span> <span style="color: #059669;">Auto</span></div>
          <div class="grid-item"><span>Grok / X</span> <span style="color: #059669;">Auto</span></div>
        </div>
      </div>
    </body>
    </html>
  `);
  await page.screenshot({ path: path.join(__dirname, '../public/screenshot-1-popup.png') });

  // 3. Generate 1280x800 Screenshot 2: In-Page Auto-Pilot HUD
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body {
          width: 1280px;
          height: 800px;
          background: #ffffff;
          position: relative;
          overflow: hidden;
          padding: 40px 60px;
        }
        .page-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .page-header h1 {
          font-size: 38px;
          font-weight: 900;
          color: #0f172a;
        }
        .page-header span {
          color: #059669;
        }
        .browser-frame {
          width: 100%;
          height: 560px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #cbd5e1;
          box-shadow: 0 25px 60px rgba(0,0,0,0.08);
          position: relative;
          padding: 24px;
        }
        .billing-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 24px;
          max-width: 600px;
          margin: 40px auto;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }
        .cancel-btn-target {
          display: inline-block;
          background: #ef4444;
          color: white;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          outline: 3px solid #10b981;
          outline-offset: 4px;
          box-shadow: 0 0 0 10px rgba(16, 185, 129, 0.2);
        }
        .floating-hud {
          position: absolute;
          bottom: 30px;
          left: 30px;
          background: #ffffff;
          border: 2px solid #10b981;
          border-radius: 18px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 0 30px rgba(16,185,129,0.25);
        }
      </style>
    </head>
    <body>
      <div class="page-header">
        <h1>Autonomous <span>In-Page Auto-Pilot HUD</span></h1>
        <p style="color: #64748b; font-size: 16px; margin-top: 4px;">Automatically finds the cancel button and bypasses tricky retention loops.</p>
      </div>

      <div class="browser-frame">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 12px;">🔒 https://account.adobe.com/plans/billing</div>
        <div class="billing-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 18px; font-weight: 800; color: #0f172a;">Creative Cloud All Apps</h3>
            <span style="font-size: 14px; font-weight: 700; color: #0f172a;">$54.99/mo</span>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px;">
            Your membership renews on the 1st of next month. You can modify or end your plan anytime.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: #94a3b8;">Plan Status: Active</span>
            <div class="cancel-btn-target">Cancel Subscription</div>
          </div>
        </div>

        <div class="floating-hud">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: #ecfdf5; border: 1px solid #a7f3d0; display: flex; align-items: center; justify-content: center; font-size: 18px;">🧩</div>
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
              <span>SubSnap Auto-Pilot</span>
              <span style="font-size: 11px; font-weight: 800; color: #059669; background: #ecfdf5; padding: 2px 8px; border-radius: 6px; border: 1px solid #a7f3d0;">3s Countdown</span>
            </div>
            <div style="font-size: 12px; color: #64748b;">Button identified · Auto-cancelling in 3 seconds...</div>
          </div>
          <div style="background: #0f172a; color: white; font-size: 12px; font-weight: 800; padding: 8px 14px; border-radius: 8px; margin-left: 12px;">Cancel Now ➔</div>
          <div style="background: #f1f5f9; color: #475569; font-size: 12px; font-weight: 700; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">Stop</div>
        </div>
      </div>
    </body>
    </html>
  `);
  await page.screenshot({ path: path.join(__dirname, '../public/screenshot-2-hud.png') });

  await browser.close();
  console.log('✅ Generated store-icon-128.png, screenshot-1-popup.png, screenshot-2-hud.png successfully!');
}

main().catch(console.error);
