// SubSnap In-Page Cancellation Assistant Content Script
(function () {
  const url = window.location.href.toLowerCase()
  const isCancelPage = 
    url.includes('cancel') ||
    url.includes('subscription') ||
    url.includes('premium') ||
    url.includes('billing') ||
    url.includes('primecentral') ||
    url.includes('account.adobe.com/plans')

  if (!isCancelPage) return

  // Avoid injecting multiple times
  if (document.getElementById('subsnap-helper-widget')) return

  const widget = document.createElement('div')
  widget.id = 'subsnap-helper-widget'
  widget.style.position = 'fixed'
  widget.style.bottom = '20px'
  widget.style.right = '20px'
  widget.style.zIndex = '999999'
  widget.style.backgroundColor = '#0f172a'
  widget.style.color = '#ffffff'
  widget.style.border = '2px solid #44e2cd'
  widget.style.borderRadius = '16px'
  widget.style.padding = '14px 18px'
  widget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(68, 226, 205, 0.3)'
  widget.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  widget.style.fontSize = '13px'
  widget.style.maxWidth = '300px'
  widget.style.transition = 'all 0.3s ease'

  widget.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
      <span style="font-weight:800; color:#44e2cd; display:flex; align-items:center; gap:4px;">
        ⚡ SubSnap Assistant
      </span>
      <button id="subsnap-close" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:14px;">✕</button>
    </div>
    <div style="font-size:12px; color:#cbd5e1; line-height:1.4; margin-bottom:10px;">
      Cancellation page detected. Click below to highlight cancel buttons or auto-guide.
    </div>
    <button id="subsnap-highlight" style="width:100%; background:linear-gradient(135deg, #44e2cd, #69ffe9); color:#003731; border:none; padding:7px; border-radius:8px; font-weight:700; font-size:11px; cursor:pointer;">
      Find Cancel Button 🎯
    </button>
  `

  document.body.appendChild(widget)

  document.getElementById('subsnap-close')?.addEventListener('click', () => {
    widget.style.display = 'none'
  })

  document.getElementById('subsnap-highlight')?.addEventListener('click', () => {
    const keywords = ['cancel', 'unsubscribe', 'end membership', 'downgrade', 'manage subscription', 'ביטול', 'בטל מנוי']
    const elements = document.querySelectorAll('button, a, div[role="button"]')
    let found = false

    elements.forEach(el => {
      const text = (el.innerText || el.textContent || '').toLowerCase()
      if (keywords.some(k => text.includes(k))) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.style.outline = '3px solid #44e2cd'
        el.style.boxShadow = '0 0 20px #44e2cd'
        el.style.transition = 'all 0.3s ease'
        found = true
      }
    })

    const statusEl = widget.querySelector('div:nth-child(2)')
    if (statusEl) {
      statusEl.innerHTML = found
        ? '<span style="color:#44e2cd; font-weight:bold;">✓ Found & highlighted cancel button!</span>'
        : '<span>No direct button found. Scroll or look under Account/Billing options.</span>'
    }
  })
})()
