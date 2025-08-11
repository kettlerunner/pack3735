(() => {
const $ = sel => document.querySelector(sel);

const startBtn = $('#startBtn');
const dailyBtn = $('#dailyBtn');
const soundBtn = $('#soundBtn');
const card = $('#card');
const leftBtn = $('#leftBtn');
const rightBtn = $('#rightBtn');
const scoreEl = $('#score');
const streakEl = $('#streak');
const comboEl = $('#combo');
const rankEl = $('#rank');
const bar = $('#bar');
const endDlg = $('#end');
const endScore = $('#endScore');
const endStreak = $('#endStreak');
const recap = $('#recap');
const againBtn = $('#againBtn');
const dailyAgainBtn = $('#dailyAgainBtn');
const shareBtn = $('#shareBtn');
const hero = document.querySelector('.hero');
const hud = document.querySelector('.hud');
const stage = document.querySelector('.stage');
const confettiC = $('#confetti');
let ghostLeft, ghostRight;

let motionOK = localStorage.getItem('lntr_settings_motion') !== 'off';
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) motionOK=false;
let settingsSound = localStorage.getItem('lntr_settings_sound') !== 'off';
updateSoundBtn();
soundBtn.addEventListener('click', () => {
  settingsSound = !settingsSound;
  localStorage.setItem('lntr_settings_sound', settingsSound ? 'on' : 'off');
  updateSoundBtn();
});
function updateSoundBtn(){
  soundBtn.textContent = `Sound: ${settingsSound ? 'On' : 'Off'}`;
  soundBtn.setAttribute('aria-pressed', settingsSound);
}

let audioCtx;
function beep(freq){
  if(!settingsSound) return;
  audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = freq;
  osc.connect(gain); gain.connect(audioCtx.destination);
  gain.gain.value = 0.2;
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
  osc.stop(audioCtx.currentTime + 0.21);
}
function vib(ms){ if(navigator.vibrate) navigator.vibrate(ms); }

const RANKS = [
  {xp:0, name:'Trail Scout'},
  {xp:400, name:'Creek Keeper'},
  {xp:900, name:'Meadow Ranger'},
  {xp:1500,name:'Forest Guardian'},
  {xp:2300,name:'Leave No Trace Ranger'}
];
let xp = parseInt(localStorage.getItem('lntr_xp')||'0',10);
let rank = localStorage.getItem('lntr_rank')||RANKS[0].name;
updateRank();
function updateRank(){
  let newRank = RANKS[0].name;
  for(const r of RANKS){ if(xp >= r.xp) newRank = r.name; }
  if(newRank !== rank){ rank = newRank; launchConfetti(); localStorage.setItem('lntr_rank', rank); }
  rankEl.textContent = `${rank} (${xp} XP)`;
  localStorage.setItem('lntr_xp', xp);
}

let deck=[], current=null, score=0, streak=0, bestStreak=0, time=60, timerId=null, played=[];

startBtn.addEventListener('click', () => startGame());
dailyBtn.addEventListener('click', () => startGame(new Date().toISOString().slice(0,10)));
againBtn.addEventListener('click', () => { endDlg.close(); startGame(); });
dailyAgainBtn.addEventListener('click', () => { endDlg.close(); startGame(new Date().toISOString().slice(0,10)); });
shareBtn.addEventListener('click', share);
leftBtn.addEventListener('click', () => submit(0));
rightBtn.addEventListener('click', () => submit(1));
document.addEventListener('keydown', keyHandler);

function keyHandler(e){
  if(!current) return;
  if(e.key==='ArrowLeft'){ leftBtn.focus(); pending=0; }
  if(e.key==='ArrowRight'){ rightBtn.focus(); pending=1; }
  if(e.key==='Enter' && pending!=null){ submit(pending); pending=null; }
}
let pending=null;

function startGame(seed){
  deck = shuffle(SCENARIOS, seed);
  current=null; score=0; streak=0; bestStreak=0; time=60; played=[]; pending=null;
  scoreEl.textContent=0; streakEl.textContent=0; comboEl.textContent='';
  hero.hidden=true; hud.hidden=false; stage.hidden=false;
  bar.style.width='100%';
  ghostLeft = $('#ghostLeft');
  ghostRight = $('#ghostRight');
  showNext();
  timerId = setInterval(tick,1000);
}

function tick(){
  time--; bar.style.width = (time/60*100)+'%';
  if(time<=0) endRound();
}

function showNext(){
  pending=null;
  if(deck.length===0){ endRound(); return; }
  current = deck.pop();
  card.className='question card';
  card.innerHTML = `<div class="icon">${current.icon}</div><div class="category">${current.category}</div><div class="prompt">${current.prompt}</div><div class="ghost left" id="ghostLeft">${current.choices[0]}</div><div class="ghost right" id="ghostRight">${current.choices[1]}</div>`;
  ghostLeft = $('#ghostLeft');
  ghostRight = $('#ghostRight');
  leftBtn.textContent = current.choices[0];
  leftBtn.setAttribute('aria-label', current.choices[0]);
  rightBtn.textContent = current.choices[1];
  rightBtn.setAttribute('aria-label', current.choices[1]);
  card.style.transform='';
}

function submit(choice){
  if(!current) return;
  const correct = choice===current.correct;
  if(correct){
    streak++;
    bestStreak = Math.max(bestStreak, streak);
    const mult = Math.min(1 + 0.1*streak, 3);
    score += Math.round(100 * mult);
    comboEl.textContent = mult>1 ? `x${mult.toFixed(1)}` : '';
    card.classList.add('correct');
    xp += 100;
    updateRank();
    vib(25); beep(520);
  } else {
    streak = 0; comboEl.textContent='';
    score -= 50;
    card.classList.add('wrong');
    const sticker=document.createElement('div');
    sticker.className='sticker';
    sticker.setAttribute('role','img');
    sticker.setAttribute('aria-label','raccoon mascot');
    sticker.textContent='🦝 thanks for the snack!';
    stage.appendChild(sticker);
    setTimeout(()=>sticker.remove(),800);

    vib(50); beep(180);
  }
  scoreEl.textContent = score;
  streakEl.textContent = streak;
  played.push({...current, correct});
  setTimeout(()=>{ card.className='question card'; showNext(); }, correct?300:600);
}

function endRound(){
  clearInterval(timerId); timerId=null; current=null;
  hero.hidden=false; hud.hidden=true; stage.hidden=true;
  endScore.textContent = `Score: ${score}`;
  endStreak.textContent = `Best streak: ${bestStreak}`;
  recap.innerHTML='';
  const rec = shuffle(played).slice(0,3);
  for(const r of rec){
    const li=document.createElement('li');
    li.textContent = `${r.icon} ${r.rationale}`;
    recap.appendChild(li);
  }
  let high = parseInt(localStorage.getItem('lntr_high')||'0',10);
  if(score>high) localStorage.setItem('lntr_high', score);
  updateRank();
  endDlg.showModal();
}

function share(){
  const msg = `I reached ${rank} with score ${score}!`;
  const url = location.origin + '/games/leave-no-trace/';
  if(navigator.share){
    navigator.share({title:'Leave No Trace Ranger', text:msg, url}).catch(()=>{});
  } else {
    navigator.clipboard.writeText(msg).then(()=>alert('Copied!'));
  }
}

function launchConfetti(){
  if(!motionOK) return;
  for(let i=0;i<20;i++){
    const d=document.createElement('div');
    d.className='confetti-piece';
    d.style.left=Math.random()*100+'%';
    d.style.background = Math.random()>0.5?'var(--gold)':'var(--blue)';
    d.style.animationDelay=(Math.random()*0.3)+'s';
    confettiC.appendChild(d);
    setTimeout(()=>d.remove(),1000);
  }
}

// drag
let startX=0, dragging=false;
card.addEventListener('pointerdown', e=>{
  if(!current) return;
  dragging=true; startX=e.clientX;
  card.setPointerCapture(e.pointerId);
  card.classList.add('dragging');
});
card.addEventListener('pointermove', e=>{
  if(!dragging) return;
  const dx = e.clientX - startX;
  card.style.transform = `translateX(${dx}px) rotate(${dx/20}deg)`;
});
card.addEventListener('pointerup', e=>{
  if(!dragging) return;
  const dx = e.clientX - startX;
  card.classList.remove('dragging');
  card.releasePointerCapture(e.pointerId);
  card.style.transform='';
  dragging=false;
  if(Math.abs(dx) > 80){ submit(dx<0?0:1); }
});
card.addEventListener('pointercancel', ()=>{ dragging=false; card.classList.remove('dragging'); card.style.transform=''; });

function shuffle(arr, seed){
  const a = arr.slice();
  let rnd = Math.random;
  if(seed){ rnd = mulberry32(hash(seed)); }
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(rnd()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function hash(str){
  let h=1779033703^str.length;
  for(let i=0;i<str.length;i++){
    h = Math.imul(h^str.charCodeAt(i),3432918353);
    h = h<<13 | h>>>19;
  }
  return function(){ h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); return (h^h>>>16)>>>0; }();
}
function mulberry32(a){
  return function(){
    a|=0; a = a + 0x6D2B79F5 |0;
    let t = Math.imul(a ^ a>>>15, 1 | a);
    t = t + Math.imul(t ^ t>>>7, 61 | t) ^ t;
    return ((t ^ t>>>14)>>>0) / 4294967296;
  };
}

// Data
const SCENARIOS = [
  { id:1,  category:"Trash Your Trash", icon:"🍌",
    prompt:"You find a banana peel on the trail.",
    choices:["Leave it—animals will eat it","Pack it out in your trash bag"],
    correct:1,
    rationale:"Even food scraps aren’t natural to the area and can harm wildlife. Pack it out." },

  { id:2,  category:"Leave What You Find", icon:"🪨",
    prompt:"You spot a shiny rock you love.",
    choices:["Take it home as treasure","Leave it for others to enjoy"],
    correct:1,
    rationale:"Leave special things so the place stays the same for everyone." },

  { id:3,  category:"Respect Wildlife", icon:"🦌",
    prompt:"A deer is grazing by the path.",
    choices:["Get closer for a photo","Watch quietly from far away"],
    correct:1,
    rationale:"Give wildlife plenty of space—use your zoom instead of your feet." },

  { id:4,  category:"Choose the Right Path", icon:"🥾",
    prompt:"A muddy spot blocks the trail.",
    choices:["Walk around off-trail","Go right through the middle"],
    correct:1,
    rationale:"Stay on durable surfaces—even if it’s muddy—to protect plants." },

  { id:5,  category:"Know Before You Go", icon:"🗺️",
    prompt:"It might rain during your hike.",
    choices:["Leave rain gear behind","Pack a light jacket or poncho"],
    correct:1,
    rationale:"Plan ahead so weather doesn’t spoil the trip or cause safety issues." },

  { id:6,  category:"Be Careful With Fire", icon:"🔥",
    prompt:"You want a campfire at a busy site.",
    choices:["Build a new fire ring","Use an existing ring or a stove"],
    correct:1,
    rationale:"Use existing fire rings or a stove to minimize impact." },

  { id:7,  category:"Share Our Trails", icon:"🚴",
    prompt:"You hear bikes behind you.",
    choices:["Keep walking in the center","Step aside and let them pass"],
    correct:1,
    rationale:"Be considerate—let faster users pass and say thank you!" },

  { id:8,  category:"Trash Your Trash", icon:"🧴",
    prompt:"You see an empty bottle near camp.",
    choices:["Pick it up and pack it out","Leave it—it’s not yours"],
    correct:0,
    rationale:"We all share responsibility—pack it out even if you didn’t drop it." },

  { id:9,  category:"Leave What You Find", icon:"🌼",
    prompt:"There are wildflowers along the trail.",
    choices:["Pick a bouquet","Take a photo instead"],
    correct:1,
    rationale:"Leave plants where they grow—photos make perfect souvenirs." },

  { id:10, category:"Respect Wildlife", icon:"🦝",
    prompt:"A raccoon is near the picnic table.",
    choices:["Give it snacks—so cute!","Put food away and watch from afar"],
    correct:1,
    rationale:"Feeding animals changes their behavior and can make them sick." },

  { id:11, category:"Choose the Right Path", icon:"🧭",
    prompt:"A shortcut cuts across switchbacks.",
    choices:["Take the shortcut","Stay on the marked switchbacks"],
    correct:1,
    rationale:"Shortcuts cause erosion—stay on the constructed trail." },

  { id:12, category:"Know Before You Go", icon:"🎒",
    prompt:"Long day hike planned.",
    choices:["No water needed","Bring water, snacks, and a small kit"],
    correct:1,
    rationale:"Prepared hikers have more fun and stay safe." },

  { id:13, category:"Be Careful With Fire", icon:"💨",
    prompt:"It’s very windy.",
    choices:["Build a big fire anyway","Skip the fire—use a stove"],
    correct:1,
    rationale:"Wind can spread embers; choose a safer option." },

  { id:14, category:"Share Our Trails", icon:"🐶",
    prompt:"You’re hiking with a dog.",
    choices:["Let it run free","Keep it close and under control"],
    correct:1,
    rationale:"Control pets to protect wildlife and other visitors." },

  { id:15, category:"Trash Your Trash", icon:"🧻",
    prompt:"Nature calls on the trail.",
    choices:["Go next to the stream","Go 200 feet away and follow local rules"],
    correct:1,
    rationale:"Dispose of waste properly—far from water and camp." },

  { id:16, category:"Leave What You Find", icon:"🪵",
    prompt:"You need kindling.",
    choices:["Break branches off trees","Gather small, dead, down wood"],
    correct:1,
    rationale:"Only use dead and down wood if fires are allowed." },

  { id:17, category:"Respect Wildlife", icon:"🦆",
    prompt:"Ducks at the lake beg for food.",
    choices:["Toss them bread","Don’t feed wildlife"],
    correct:1,
    rationale:"Human food isn’t healthy for animals—observe, don’t feed." },

  { id:18, category:"Choose the Right Path", icon:"🪨",
    prompt:"You’re beside a stream.",
    choices:["Walk on plants at the edge","Travel on rocks or dry sand"],
    correct:1,
    rationale:"Use durable surfaces to protect fragile areas." }
];

})();
