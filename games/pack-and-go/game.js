/* Pack & Go — Six Essentials (mobile-first) */
(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // Elements
  const startBtn = $('#startBtn');
  const howBtn   = $('#howBtn');
  const soundBtn = $('#soundBtn');

  const scoreEl  = $('#score');
  const highEl   = $('#high');
  const packedEl = $('#packed');
  const barEl    = $('#bar');

  const board    = $('#board');
  const slots    = $('#slots');

  const modal    = $('#modal');
  const resultTitle = $('#resultTitle');
  const resultBody  = $('#resultBody');
  const tipTitle = $('#tipTitle');
  const tipText  = $('#tipText');
  const againBtn = $('#againBtn');
  const shareBtn = $('#shareBtn');

  const howDlg   = $('#how');
  const patchRow = $('#patchRow');

  // LocalStorage keys
  const LS = {
    HIGH:  'packgo_high',
    SOUND: 'packgo_sound',
    PATCH: 'packgo_patch_essentials_v1'
  };

  // Essentials + decoys
  const ESSENTIALS = [
    {id:'water',  name:'Water',         emoji:'🥤', tip:'Bring enough water and sip often to stay hydrated.'},
    {id:'food',   name:'Trail Food',    emoji:'🥪', tip:'Healthy snacks keep your energy up on the trail.'},
    {id:'first',  name:'First Aid',     emoji:'🧰', tip:'A small kit handles blisters and scrapes.'},
    {id:'sun',    name:'Sun Protection',emoji:'🧴', tip:'Hat and sunscreen prevent painful sunburns.'},
    {id:'whistle',name:'Whistle',       emoji:'📯', tip:'Three blasts is a universal distress call.'},
    {id:'light',  name:'Flashlight',    emoji:'🔦', tip:'A light is handy and helps you stay safe.'},
  ];
  const DECOYS = [
    {id:'console', name:'Game Console', emoji:'🎮'},
    {id:'brick',   name:'Cinder Block', emoji:'🧱'},
    {id:'tv',      name:'TV Remote',    emoji:'📺'},
    {id:'slime',   name:'Slime',        emoji:'🫠'},
    {id:'pine',    name:'Pineapple',    emoji:'🍍'},
    {id:'skate',   name:'Skateboard',   emoji:'🛹'},
    {id:'toy',     name:'Robot Toy',    emoji:'🤖'},
    {id:'ball',    name:'Soccer Ball',  emoji:'⚽'},
  ];

  // State
  let score=0, packed=0, running=false;
  let dur = 45_000;            // 45s
  let t0  = 0;
  let rafId = null;
  let progress = 0;            // 0..1
  const packedSet = new Set();

  // Init UI
  highEl.textContent = localStorage.getItem(LS.HIGH) || '0';
  setSound((localStorage.getItem(LS.SOUND)||'0') === '1');
  renderPatches();
  resetSlots();

  // Utils
  const shuffle = (arr) => arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(v=>v[1]);
  const byId = (id) => ESSENTIALS.find(e=>e.id===id);

  // Audio (tiny WebAudio bleeps) + haptics
  let ctx=null;
  function isSound(){ return soundBtn.getAttribute('aria-pressed') === 'true'; }
  function setSound(on){
    soundBtn.setAttribute('aria-pressed', on?'true':'false');
    soundBtn.textContent = `Sound: ${on?'On':'Off'}`;
    localStorage.setItem(LS.SOUND, on?'1':'0');
  }
  function beep(freq=440, time=0.07){
    if (!isSound()) return;
    try{
      if (!ctx) ctx = new (window.AudioContext||window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq; g.gain.value = .08;
      o.start(); setTimeout(()=>o.stop(), time*1000);
    }catch{}
  }
  const haptic = (ms=35)=>{ try{ navigator.vibrate && navigator.vibrate(ms); }catch{} };

  // Slots
  function resetSlots(){
    slots.innerHTML = '';
    for(let i=0;i<6;i++){
      const li = document.createElement('li');
      li.className = 'slot';
      li.textContent = 'Empty';
      li.setAttribute('aria-label','Empty slot');
      slots.appendChild(li);
    }
  }

  // Items
  function renderItems(){
    board.innerHTML = '';
    const items = shuffle([...ESSENTIALS, ...shuffle(DECOYS).slice(0,4)]);
    items.forEach(obj=>{
      const btn = document.createElement('button');
      btn.className = 'item';
      btn.dataset.id = obj.id;
      btn.dataset.good = String(!!byId(obj.id));
      btn.innerHTML = `
        <span class="emoji" aria-hidden="true">${obj.emoji}</span>
        <span class="name">${obj.name}</span>`;
      btn.setAttribute('aria-label', obj.name);
      btn.addEventListener('click', onPick);
      board.appendChild(btn);
    });
  }

  function onPick(e){
    if (!running) return;
    const btn  = e.currentTarget;
    const good = btn.dataset.good === 'true';
    btn.setAttribute('disabled','true');

    if (good){
      const id   = btn.dataset.id;
      const name = btn.querySelector('.name').textContent;
      if (!packedSet.has(id)){
        packedSet.add(id);
        packed++;
        score += 100;
        const slot = $$('.slot').find(s=>!s.classList.contains('filled'));
        slot.classList.add('filled');
        slot.textContent = name;
        slot.setAttribute('aria-label', `${name} packed`);
      }
      btn.classList.add('good');
      beep(660,.06); haptic(25);
    }else{
      score = Math.max(0, score - 50);
      btn.classList.add('bad');
      setTimeout(()=>btn.classList.remove('bad'), 350);
      beep(220,.09); haptic(40);
    }
    updateHud();

    if (packed === 6) endRound(true);
  }

  function updateHud(){
    scoreEl.textContent = String(score);
    packedEl.textContent = `${packed}/6`;
  }

  // Timer
  function startTimer(){
    t0 = performance.now();
    progress = 0;
    cancelAnimationFrame(rafId);
    const tick = (now) => {
      progress = Math.min((now - t0)/dur, 1);
      barEl.style.transform = `scaleX(${1 - progress})`;
      if (!running) return;
      if (progress >= 1){ endRound(false); return; }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  // Round control
  function startRound(){
    running = true;
    score = 0; packed = 0; progress = 0;
    packedSet.clear();
    updateHud();
    resetSlots();
    renderItems();
    barEl.style.transform = 'scaleX(1)';
    startTimer();
  }

  function endRound(allPacked){
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);

    // Time bonus (remaining fraction * 600)
    const rem = Math.max(0, 1 - progress);
    const timeBonus = Math.round(rem * 600);
    score += timeBonus;

    // Perfect bonus + patch
    let earnedPatch = false;
    if (allPacked){
      score += 250;
      localStorage.setItem(LS.PATCH,'1');
      earnedPatch = true;
    }

    // High score
    const high = parseInt(localStorage.getItem(LS.HIGH)||'0',10);
    if (score > high){
      localStorage.setItem(LS.HIGH, String(score)); // <-- BUGGY LINE WAS HERE
    }
    // FIX:
    if (score > high){
      localStorage.setItem(LS.HIGH, String(score));
      highEl.textContent = String(score);
    }

    // Build result text
    const missing = ESSENTIALS.filter(e=>!packedSet.has(e.id)).map(e=>e.name);
    const tip = allPacked
      ? ESSENTIALS[Math.floor(Math.random()*ESSENTIALS.length)].tip
      : `Still need: ${missing.join(', ')}. Try again!`;

    resultTitle.textContent = allPacked ? 'Great job!' : 'Time’s up!';
    resultBody.textContent  = `Score: ${score}  •  Time bonus: ${timeBonus}${allPacked ? '  •  Perfect bonus: 250' : ''}`;
    tipTitle.textContent    = allPacked ? 'Scout Tip' : 'Hint';
    tipText.textContent     = tip;

    renderPatches();

    // Show modal
    try { modal.showModal(); } catch { modal.setAttribute('open',''); }
  }

  // Patches UI
  function renderPatches(){
    patchRow.innerHTML = '';
    const earned = localStorage.getItem(LS.PATCH) === '1';
    const span = document.createElement('span');
    span.className = 'patch' + (earned ? ' earned':'');
    span.textContent = 'Six Essentials Patch';
    patchRow.appendChild(span);
  }

  // Share
  async function shareScore(){
    const text = `I packed the Six Essentials in Pack & Go with a score of ${score}!`;
    const url = location.origin || '';
    try{
      if (navigator.share){
        await navigator.share({ title:'Pack 3735 — Pack & Go', text, url });
      }else{
        await navigator.clipboard.writeText(`${text} ${url}`);
        alert('Score copied to clipboard—paste to share!');
      }
    }catch{ /* user cancelled */ }
  }

  // Events
  startBtn.addEventListener('click', () => {
    if (modal.open) modal.close();
    startRound();
  });
  againBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (modal.open) modal.close();
    startRound();
  });

  howBtn.addEventListener('click', () => {
    try { howDlg.showModal(); } catch { howDlg.setAttribute('open',''); }
  });

  shareBtn.addEventListener('click', (e) => {
    e.preventDefault();
    shareScore();
  });

  soundBtn.addEventListener('click', () => setSound(!isSound()));

  // Close modals on backdrop click (for browsers that support <dialog>)
  [modal, howDlg].forEach(dlg=>{
    dlg?.addEventListener('click', (e)=>{
      const r = dlg.getBoundingClientRect();
      const inDialog = (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom);
      if (!inDialog) dlg.close?.();
    });
  });
})();
