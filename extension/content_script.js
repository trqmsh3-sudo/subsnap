// SubSnap In-Page Cancellation Assistant Content Script
(function () {
  const url = window.location.href.toLowerCase()
  const isCancelPage = 
    url.includes('cancel') ||
    url.includes('subscription') ||
    url.includes('premium') ||
    url.includes('billing') ||
    url.includes('manage') ||
    url.includes('account.adobe.com/plans')

  if (!isCancelPage) return
  if (document.getElementById('subsnap-helper-widget')) return

  const widget = document.createElement('div')
  widget.id = 'subsnap-helper-widget'
  widget.style.position = 'fixed'
  widget.style.bottom = '24px'
  widget.style.left = '24px'
  widget.style.zIndex = '9999999'
  widget.style.backgroundColor = '#ffffff'
  widget.style.color = '#0f172a'
  widget.style.border = '2px solid #059669'
  widget.style.borderRadius = '18px'
  widget.style.padding = '16px 20px'
  widget.style.boxShadow = '0 12px 35px -5px rgba(0, 0, 0, 0.15), 0 0 15px rgba(5, 150, 105, 0.15)'
  widget.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Heebo", sans-serif'
  widget.style.fontSize = '13px'
  widget.style.maxWidth = '320px'
  widget.style.direction = 'rtl'
  widget.style.transition = 'all 0.3s ease'

  widget.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
      <span style="font-weight:900; color:#059669; display:flex; align-items:center; gap:6px; font-size:14px;">
        ⚡ SubSnap Assistant
      </span>
      <button id="subsnap-close" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:16px;">✕</button>
    </div>
    <div id="subsnap-status" style="font-size:12px; color:#475569; line-height:1.4; margin-bottom:12px;">
      עמוד ביטול זוהה! לחץ למטה לאיתור והדגשת כפתור הביטול המדויק בעמוד זה.
    </div>
    <button id="subsnap-action-btn" style="width:100%; background:#059669; color:#ffffff; border:none; padding:9px 12px; border-radius:10px; font-weight:700; font-size:12px; cursor:pointer; transition:background 0.15s;">
      אתר והדגש כפתור ביטול 🎯
    </button>
  `

  document.body.appendChild(widget)

  document.getElementById('subsnap-close')?.addEventListener('click', () => {
    widget.style.display = 'none'
  })

  document.getElementById('subsnap-action-btn')?.addEventListener('click', () => {
    const keywords = [
      'cancel subscription', 'cancel plan', 'cancel membership', 'end membership', 
      'manage subscription', 'downgrade', 'cancel my subscription', 'end subscription',
      'בטל מנוי', 'ביטול מנוי', 'סיום מנוי', 'הפסקת מנוי', 'בטל תוכנית'
    ]
    const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"]'))
    let foundEl = null

    for (const el of elements) {
      const text = (el.innerText || el.textContent || '').toLowerCase().trim()
      if (keywords.some(k => text.includes(k))) {
        foundEl = el
        break
      }
    }

    const statusEl = document.getElementById('subsnap-status')
    const actionBtn = document.getElementById('subsnap-action-btn')

    if (foundEl) {
      foundEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      foundEl.style.outline = '4px solid #059669'
      foundEl.style.boxShadow = '0 0 25px rgba(5, 150, 105, 0.8)'
      foundEl.style.transition = 'all 0.3s ease'

      if (statusEl) {
        statusEl.innerHTML = '<span style="color:#059669; font-weight:bold;">✓ כפתור הביטול אותר והודגש בירוק על המסך!</span>'
      }
      if (actionBtn) {
        actionBtn.innerText = 'לחץ על הכפתור המסומן להשלמת הביטול 👆'
        actionBtn.style.background = '#047857'
      }
    } else {
      if (statusEl) {
        statusEl.innerHTML = '<span>גלול בעמוד או חפש תחת לשונית Billing / Plans / Subscription.</span>'
      }
    }
  })
})()
