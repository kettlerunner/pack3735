// Utilities
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Year
const yrEl = $('#yr');
if (yrEl) yrEl.textContent = new Date().getFullYear();

function initNav(){
  const drawer = $('#drawer');
  const openNav = $('#openNav');
  const closeNav = $('#closeNav');
  const closeNavBtn = $('#closeNavBtn');
  const sheetLinks = $$('.sheet a');
  let lastFocused = null;
  if (!drawer || !openNav || !closeNav || !closeNavBtn) return;

  function openDrawer(){
    drawer.classList.add('open');
    openNav.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    lastFocused = document.activeElement;
    const first = $('.sheet a, .sheet button');
    if (first) first.focus();
    document.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', escToClose);
  }
  function closeDrawer(){
    drawer.classList.remove('open');
    openNav.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    document.removeEventListener('keydown', trapFocus);
    document.removeEventListener('keydown', escToClose);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }
  function trapFocus(e){
    if (e.key !== 'Tab') return;
    const focusables = $$('.sheet button, .sheet a');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
  function escToClose(e){
    if (e.key === 'Escape') { closeDrawer(); }
  }

  openNav.addEventListener('click', openDrawer);
  closeNav.addEventListener('click', closeDrawer);
  closeNavBtn.addEventListener('click', closeDrawer);
  sheetLinks.forEach(a => a.addEventListener('click', closeDrawer));
}

(async function loadHeader(){
  const placeholder = document.getElementById('siteHeader');
  if (placeholder){
    const res = await fetch('/partials/header.html');
    placeholder.outerHTML = await res.text();
  }
  initNav();
})();

/* -------- Social gallery: likes, filters, share, lightbox -------- */

(function(){
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  // Local likes
  const LS_KEY = 'pack3735_likes';
  const likes = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  const tiles = Array.from(gallery.querySelectorAll('.tile'));

  // Initialize UI
  tiles.forEach(t => {
    const id = t.getAttribute('data-id');
    const likeBtn = t.querySelector('.btn-like');
    if (likes[id]) likeBtn.classList.add('liked');
  });

  // Like toggle
  gallery.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.btn-like');
    if (!btn) return;
    const tile = btn.closest('.tile');
    const id = tile.getAttribute('data-id');
    const isLiked = btn.classList.toggle('liked');
    likes[id] = isLiked ? 1 : 0;
    localStorage.setItem(LS_KEY, JSON.stringify(likes));
  });

  // Share (Web Share API on mobile; fallback to opening image)
  gallery.addEventListener('click', async (e) => {
    const btn = e.target.closest && e.target.closest('.btn-share');
    if (!btn) return;
    const tile = btn.closest('.tile');
    const img = tile.querySelector('img');
    const url = img.getAttribute('data-full') || img.currentSrc || img.src;
    const title = 'Pack 3735 — Photo';
    const text = 'Check out this moment from Pack 3735!';
    try{
      if (navigator.share){
        await navigator.share({ title, text, url });
      }else{
        window.open(url, '_blank', 'noopener');
      }
    }catch(err){ /* user cancelled */ }
  });

  // Filters
  const chips = document.getElementById('photoChips');
  if (chips){
    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip'); if (!chip) return;
      chips.querySelectorAll('.chip').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-selected','false'); });
      chip.classList.add('active'); chip.setAttribute('aria-selected','true');

      const tag = chip.getAttribute('data-filter');
      tiles.forEach(t => {
        const tags = (t.getAttribute('data-tags') || '').split(',').map(s => s.trim());
        const show = tag === 'all' || tags.includes(tag);
        t.style.display = show ? 'inline-block' : 'none';
      });
      // Force masonry reflow by toggling column count (hacky but reliable)
      gallery.style.columns = getComputedStyle(gallery).columns; // noop triggers reflow on some browsers
    });
  }

  // Lightbox
  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.innerHTML = `
    <div class="bg"></div>
    <div class="stage">
      <img alt="Gallery image" />
      <button class="close" aria-label="Close">✕</button>
      <button class="prev" aria-label="Previous">‹</button>
      <button class="next" aria-label="Next">›</button>
    </div>`;
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('img');
  const btnClose = lb.querySelector('.close');
  const btnPrev = lb.querySelector('.prev');
  const btnNext = lb.querySelector('.next');

  let currentIndex = -1;
  const visibleTiles = () => tiles.filter(t => t.style.display !== 'none');

  function openAt(idx){
    const vis = visibleTiles();
    if (!vis.length) return;
    currentIndex = ((idx % vis.length) + vis.length) % vis.length;
    const img = vis[currentIndex].querySelector('img');
    const full = img.getAttribute('data-full') || img.currentSrc || img.src;
    lbImg.src = full;
    lb.classList.add('open');
    document.addEventListener('keydown', onKey);
    startSwipe();
    btnClose.focus();
  }
  function closeLB(){
    lb.classList.remove('open');
    lbImg.removeAttribute('src');
    document.removeEventListener('keydown', onKey);
    endSwipe();
  }
  function prev(){ openAt(currentIndex - 1); }
  function next(){ openAt(currentIndex + 1); }

  function onKey(e){
    if (e.key === 'Escape') return closeLB();
    if (e.key === 'ArrowLeft') return prev();
    if (e.key === 'ArrowRight') return next();
  }

  // open on image click
  gallery.addEventListener('click', (e) => {
    const img = e.target.closest && e.target.closest('.tile .media img');
    if (!img) return;
    const tile = img.closest('.tile');
    const vis = visibleTiles();
    openAt(vis.indexOf(tile));
  });

  // click outs
  lb.querySelector('.bg').addEventListener('click', closeLB);
  btnClose.addEventListener('click', closeLB);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);

  // Swipe navigation (phones)
  let startX = null;
  function onTouchStart(e){ startX = e.touches[0].clientX; }
  function onTouchMove(e){ /* no-op, but could add previews */ }
  function onTouchEnd(e){
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const THRESH = 48;
    if (dx > THRESH) prev();
    else if (dx < -THRESH) next();
    startX = null;
  }
  function startSwipe(){
    lbImg.addEventListener('touchstart', onTouchStart, {passive:true});
    lbImg.addEventListener('touchmove', onTouchMove, {passive:true});
    lbImg.addEventListener('touchend', onTouchEnd, {passive:true});
  }
  function endSwipe(){
    lbImg.removeEventListener('touchstart', onTouchStart);
    lbImg.removeEventListener('touchmove', onTouchMove);
    lbImg.removeEventListener('touchend', onTouchEnd);
  }

  // “Submit Photos” CTA (replace with your album link)
  const addPhotos = document.getElementById('addPhotos');
  if (addPhotos){
    addPhotos.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Coming soon: link to your shared Google Photos album or Drive folder for uploads.');
    });
  }
})();

// Road America teaser lightbox
(()=>{
  const thumbs=document.querySelectorAll('.ra-thumb');
  const lb=document.getElementById('ra-lightbox');
  if(!thumbs.length||!lb) return;
  const lbImg=lb.querySelector('img');
  const btnClose=lb.querySelector('.close');
  const bg=lb.querySelector('.bg');
  let activeThumb=null;
  const close=()=>{
    lb.classList.remove('open');
    lb.setAttribute('hidden','');
    lbImg.removeAttribute('src');
    activeThumb&&activeThumb.focus();
  };
  thumbs.forEach(thumb=>{
    thumb.addEventListener('click',e=>{
      e.preventDefault();
      activeThumb=thumb;
      lbImg.src=thumb.href;
      lb.removeAttribute('hidden');
      lb.classList.add('open');
      btnClose.focus();
    });
  });
  btnClose.addEventListener('click',close);
  bg.addEventListener('click',close);
  lb.addEventListener('keydown',e=>{if(e.key==='Escape') close();});
})();

/* -------- Simple polls (local only) -------- */
(()=>{
  const polls=document.querySelectorAll('[data-poll]');
  polls.forEach(poll=>{
    const id=poll.dataset.poll;
    const LS_KEY=`poll_${id}`;
    let counts={};
    try{counts=JSON.parse(localStorage.getItem(LS_KEY)||'{}');}catch(err){counts={};}
    const buttons=poll.querySelectorAll('button[data-choice]');
    const results=poll.nextElementSibling && poll.nextElementSibling.classList.contains('poll-results') ? poll.nextElementSibling : null;
    function render(){
      if(!results) return;
      results.innerHTML='';
      buttons.forEach(btn=>{
        const c=btn.dataset.choice;
        const li=document.createElement('li');
        li.textContent=`${btn.textContent}: ${counts[c]||0}`;
        results.appendChild(li);
      });
    }
    render();
    poll.addEventListener('click',e=>{
      const btn=e.target.closest('button[data-choice]');
      if(!btn) return;
      const c=btn.dataset.choice;
      counts[c]=(counts[c]||0)+1;
      localStorage.setItem(LS_KEY,JSON.stringify(counts));
      render();
    });
  });
})();

