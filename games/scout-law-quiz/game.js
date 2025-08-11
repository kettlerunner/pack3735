const scoutLaw = [
  "Trustworthy","Loyal","Helpful","Friendly","Courteous","Kind",
  "Obedient","Cheerful","Thrifty","Brave","Clean","Reverent"
];

const startBtn = document.getElementById('startBtn');
const quiz = document.getElementById('quiz');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedback = document.getElementById('feedback');
const progress = document.getElementById('progress');

let remaining = [];
let score = 0;
let qNum = 0;

function nextQuestion(){
  feedback.textContent = '';
  if(remaining.length === 0){
    questionEl.textContent = `You scored ${score} / ${scoutLaw.length}!`;
    optionsEl.innerHTML = '';
    const again = document.createElement('button');
    again.textContent = 'Play Again';
    again.className = 'btn btn-primary';
    again.addEventListener('click', startGame);
    optionsEl.appendChild(again);
    progress.textContent = '';
    return;
  }

  qNum++;
  progress.textContent = `Question ${qNum} of ${scoutLaw.length}`;

  const correctIndex = Math.floor(Math.random() * remaining.length);
  const correct = remaining.splice(correctIndex,1)[0];
  questionEl.textContent = 'Which of these is a point of the Scout Law?';
  const opts = new Set([correct]);
  while(opts.size < 4){
    opts.add(scoutLaw[Math.floor(Math.random() * scoutLaw.length)]);
  }
  const shuffled = Array.from(opts).sort(() => Math.random() - 0.5);
  optionsEl.innerHTML = '';
  shuffled.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.className = 'btn btn-outline';
    btn.addEventListener('click', () => select(opt, correct));
    optionsEl.appendChild(btn);
  });
}

function select(choice, correct){
  Array.from(optionsEl.children).forEach(btn => btn.disabled = true);
  if(choice === correct){
    feedback.textContent = 'Correct!';
    score++;
  }else{
    feedback.textContent = `Oops! It\'s ${correct}.`;
  }
  setTimeout(nextQuestion, 1000);
}

function startGame(){
  startBtn.style.display = 'none';
  quiz.hidden = false;
  remaining = [...scoutLaw];
  score = 0;
  qNum = 0;
  nextQuestion();
}

startBtn.addEventListener('click', startGame);
