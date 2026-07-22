/* AID teaser bubble + auto-open schedule (v3, 2026-07-22):
   teaser at 10s next to the closed launcher, auto-open never before 20s.
   Pages with the data-aid-widget-boost snippet keep that snippet's own 20s
   opener; this block only auto-opens on pages without it. Clicking the
   teaser or the launcher opens the chat immediately. */
(function () {
  var WID = '54722168';
  var BUBBLE_ID = 'ultra-fast-widget-bubble-' + WID;
  var OPEN_KEY = 'aidWidgetAutoOpened';
  var LEGACY_KEY = 'aidDemoWidgetAutoOpened';
  var TEASER_KEY = 'aidTeaserShown';
  var TEASER_AT = 10; /* seconds, the old auto-open moment */
  var OPEN_AT = 20;   /* seconds, minimum auto-open delay */
  var hasBoost = !!document.querySelector('script[data-aid-widget-boost]');
  function bubble() { return document.getElementById(BUBBLE_ID); }
  function isOpen() {
    var c = document.getElementById('ultra-fast-widget-container-' + WID);
    return !!(c && getComputedStyle(c).display !== 'none');
  }
  function alreadyOpened() {
    try { return !!(sessionStorage.getItem(OPEN_KEY) || sessionStorage.getItem(LEGACY_KEY)); } catch (e) { return false; }
  }
  var teaser = null;
  var userTouched = false;
  document.addEventListener('click', function (e) {
    if (e.isTrusted && e.target && e.target.closest && e.target.closest('#' + BUBBLE_ID)) {
      userTouched = true;
      hideTeaser();
    }
  }, true);
  function hideTeaser() {
    if (!teaser) return;
    var t = teaser;
    teaser = null;
    t.style.opacity = '0';
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 450);
  }
  function openChat() {
    hideTeaser();
    var b = bubble();
    if (b && !isOpen()) b.click();
  }
  function showTeaser() {
    if (teaser || userTouched || isOpen() || alreadyOpened()) return;
    try {
      if (sessionStorage.getItem(TEASER_KEY)) return;
      sessionStorage.setItem(TEASER_KEY, '1');
    } catch (e) {}
    var d = document.createElement('div');
    d.setAttribute('data-aid-teaser', '');
    d.setAttribute('role', 'button');
    d.setAttribute('tabindex', '0');
    d.style.cssText = 'position:fixed;right:20px;bottom:98px;z-index:999998;max-width:250px;background:#141419;color:#F4F4F5;padding:13px 32px 13px 16px;border-radius:16px;border:1px solid rgba(201,168,76,.45);box-shadow:0 12px 28px rgba(0,0,0,.5);font:500 14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;cursor:pointer;opacity:0;transform:translateY(10px);transition:opacity .5s ease,transform .5s ease;';
    var txt = document.createElement('p');
    txt.style.cssText = 'margin:0;';
    txt.textContent = "Give your customers AN OFFER they can't refuse! 🎙️";
    var x = document.createElement('button');
    x.type = 'button';
    x.setAttribute('aria-label', 'Dismiss');
    x.textContent = '×';
    x.style.cssText = 'position:absolute;top:2px;right:6px;background:transparent;border:none;color:rgba(244,244,245,.55);font-size:18px;line-height:1;cursor:pointer;padding:2px 4px;';
    x.addEventListener('click', function (e) { e.stopPropagation(); hideTeaser(); });
    var arrow = document.createElement('span');
    arrow.style.cssText = 'position:absolute;bottom:-7px;right:26px;width:12px;height:12px;background:#141419;border-right:1px solid rgba(201,168,76,.45);border-bottom:1px solid rgba(201,168,76,.45);transform:rotate(45deg);';
    d.appendChild(txt);
    d.appendChild(x);
    d.appendChild(arrow);
    d.addEventListener('click', function (e) { if (e.target === x) return; e.stopPropagation(); openChat(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChat(); } });
    document.body.appendChild(d);
    teaser = d;
    requestAnimationFrame(function () { d.style.opacity = '1'; d.style.transform = 'translateY(0)'; });
  }
  var ticks = 0;
  var timer = setInterval(function () {
    ticks += 1;
    if (isOpen()) {
      hideTeaser();
      if (hasBoost || ticks >= OPEN_AT) clearInterval(timer);
      return;
    }
    var b = bubble();
    if (b && ticks >= TEASER_AT) showTeaser();
    if (!hasBoost && b && ticks >= OPEN_AT) {
      clearInterval(timer);
      hideTeaser();
      var guard = alreadyOpened();
      try { sessionStorage.setItem(LEGACY_KEY, '1'); } catch (e) {}
      if (!guard && !userTouched && !isOpen()) b.click();
    }
    if (ticks > 60) clearInterval(timer);
  }, 1000);
})();

(function(){
  'use strict';

  // ── SMS SEQUENCER ──────────────────────────────────────────────────────────
  var messages = [
    { type: 'incoming', text: "My AC just stopped working and it’s 92 degrees out. Is anyone available tonight?" },
    { type: 'outgoing', text: "Hi, this is Apex Mechanical’s AI receptionist. Our technicians are on call for emergencies tonight. What’s your address in Charlotte?" },
    { type: 'incoming', text: "4812 Sunridge Dr, off Rea Rd near Providence. House is already at 85 inside." },
    { type: 'outgoing', text: "We can dispatch a tech to your area tonight. You’ll get a text with your technician’s name and ETA in under 5 minutes." }
  ];

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function buildThread(threadEl, replayBtn) {
    var generation = 0;

    function playThread() {
      generation++;
      var gen = generation;
      // clear
      threadEl.innerHTML = '';
      if (prefersReduced) {
        messages.forEach(function(m){ appendBubble(m, threadEl, true); });
        return;
      }
      var idx = 0;
      function nextBubble() {
        if (gen !== generation) return;
        if (idx >= messages.length) return;
        var m = messages[idx];
        var typing = null;
        if (m.type === 'outgoing') {
          typing = appendTyping(threadEl);
        }
        var delay = m.type === 'outgoing' ? 1100 : 600;
        setTimeout(function(){
          if (gen !== generation) return;
          if (typing) typing.remove();
          var b = appendBubble(m, threadEl, false);
          setTimeout(function(){ if (gen !== generation) return; b.classList.add('shown'); }, 20);
          idx++;
          setTimeout(nextBubble, 800 + (m.text.length * 14));
        }, delay);
      }
      setTimeout(nextBubble, 400);
    }

    function resetThread() {
      generation++;
      threadEl.innerHTML = '';
    }

    if (replayBtn) {
      replayBtn.addEventListener('click', function(){ playThread(); });
    }

    // IntersectionObserver: re-arm every entry
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          playThread();
        } else {
          resetThread();
        }
      });
    }, { threshold: 0.3 });
    io.observe(threadEl);

    // Also handle prefers-reduced-motion toggle mid-session
    if (window.matchMedia) {
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function(e){
        prefersReduced = e.matches;
      });
    }

    return { play: playThread, reset: resetThread };
  }

  function appendBubble(m, container, shown) {
    var el = document.createElement('div');
    el.className = 'bubble ' + m.type + (shown ? ' shown' : '');
    el.textContent = m.text;
    container.appendChild(el);
    return el;
  }

  function appendTyping(container) {
    var el = document.createElement('div');
    el.className = 'typing-indicator shown';
    el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    container.appendChild(el);
    return el;
  }

  // Desktop thread
  var desktopThread = document.getElementById('sms-thread-desktop');
  var desktopReplay = document.getElementById('replay-btn-desktop');
  if (desktopThread) buildThread(desktopThread, desktopReplay);

  // Mobile: inject phone frame clone into hero slot
  var mobileSlot = document.getElementById('mobile-demo-slot');
  if (mobileSlot && window.innerWidth <= 820) {
    var mobileFrame = document.createElement('div');
    mobileFrame.style.marginTop = '1rem';
    mobileFrame.innerHTML = '<div class="phone-frame" id="phone-frame-mobile">'
      + '<div class="phone-header">'
      + '<div class="phone-header-dot"></div>'
      + '<div class="phone-header-text">Apex Mechanical &middot; SMS Response</div>'
      + '</div>'
      + '<div class="sms-thread" id="sms-thread-mobile"></div>'
      + '</div>'
      + '<button class="replay-btn" id="replay-btn-mobile" style="margin-top:.6rem" aria-label="Replay SMS demo">'
      + '<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 6A4 4 0 1 1 6 2V0L9 3l-3 3V4a2 2 0 1 0 2 2z" fill="currentColor"/></svg>'
      + 'Replay</button>';
    mobileSlot.appendChild(mobileFrame);
    var mobileThread = document.getElementById('sms-thread-mobile');
    var mobileReplay = document.getElementById('replay-btn-mobile');
    if (mobileThread) buildThread(mobileThread, mobileReplay);
  }

  // ── STAT COUNTER ──────────────────────────────────────────────────────────
  var statTarget = 3;
  var statEl = document.getElementById('stat-display');
  var statCountRun = 0;

  function runCount() {
    statCountRun++;
    var run = statCountRun;
    if (prefersReduced) { if (statEl) statEl.textContent = statTarget; return; }
    var start = 0;
    var duration = 1800;
    var startTime = null;
    function step(ts) {
      if (run !== statCountRun) return;
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = Math.round(start + eased * (statTarget - start));
      if (statEl) statEl.textContent = val;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var statReplayBtn = document.getElementById('stat-replay');
  if (statReplayBtn) statReplayBtn.addEventListener('click', function(){ runCount(); });

  var statObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) runCount();
    });
  }, { threshold: 0.4 });
  var mathSection = document.querySelector('.math-section');
  if (mathSection) statObserver.observe(mathSection);

  // ── HOW CARDS REVEAL ──────────────────────────────────────────────────────
  var howCards = document.querySelectorAll('.how-card');
  var cardObs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry, i){
      if (entry.isIntersecting) {
        setTimeout(function(){ entry.target.classList.add('revealed'); }, 0);
      }
    });
  }, { threshold: 0.15 });
  howCards.forEach(function(c){ cardObs.observe(c); });

  // ── GENERAL REVEAL ────────────────────────────────────────────────────────
  var revealEls = document.querySelectorAll('.reveal');
  var revObs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) entry.target.classList.add('in');
    });
  }, { threshold: 0.1 });
  revealEls.forEach(function(el){ revObs.observe(el); });

  // ── STICKY CTA hide when real CTA visible ────────────────────────────────
  var stickyCta = document.getElementById('sticky-cta');
  var ctaSection = document.getElementById('cta-section');
  if (stickyCta && ctaSection) {
    var ctaObs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) stickyCta.classList.add('hidden');
        else stickyCta.classList.remove('hidden');
      });
    }, { threshold: 0.1 });
    ctaObs.observe(ctaSection);
  }

})();
// ── 7/16 sequencer contract override (patched 2026-07-21) ──
// play at ~15% visible; re-arm ONLY after full viewport exit; replay hard-resets.
;(function(){
  // Locate the SMS thread element (try common IDs in priority order)
  var threadIds = ['thread','thread-mobile','thread-desktop','sms-thread','sms-thread-desktop','demo-thread'];
  var threadEl = null;
  for (var _i = 0; _i < threadIds.length; _i++){
    threadEl = document.getElementById(threadIds[_i]);
    if (threadEl) break;
  }
  if (!threadEl) return; // no thread found — bail

  // Locate replay buttons (use the FIRST one if multiple)
  var replayBtns = Array.prototype.slice.call(document.querySelectorAll('[id*="replay"],[data-replay]'));

  function hardReset(){
    // Simulate a replay button click to let the existing implementation reset+play.
    // If no replay button exists, try firing a custom event the sequencer may listen for.
    if (replayBtns.length > 0){ replayBtns[0].click(); }
  }

  var _armed = true;
  function _autoplay(){
    if (!_armed) return;
    _armed = false;
    hardReset();
  }

  // playIO: fires when >= 15% of the thread is visible
  var playIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting && e.intersectionRatio >= 0.15){ _autoplay(); }
    });
  }, { threshold: 0.18 });
  playIO.observe(threadEl);

  // rearmIO: fires when thread fully exits the viewport (threshold:0 + !isIntersecting)
  var rearmIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting){ _armed = true; }
    });
  }, { threshold: 0 });
  rearmIO.observe(threadEl);

  // Check already-visible case at init time
  var _rect = threadEl.getBoundingClientRect();
  var _vh = window.innerHeight || document.documentElement.clientHeight;
  var _vis = Math.min(_rect.bottom, _vh) - Math.max(_rect.top, 0);
  if (_rect.height > 0 && _vis / _rect.height >= 0.15){ _autoplay(); }
})();
