const scoutLaw = [
  "Trustworthy","Loyal","Helpful","Friendly","Courteous","Kind",
  "Obedient","Cheerful","Thrifty","Brave","Clean","Reverent"
];

const startBtn = document.getElementById('startBtn');
const quiz = document.getElementById('quiz');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedback = document.getElementById('feedback');

function nextQuestion(){
  feedback.textContent = '';
  const correctIndex = Math.floor(Math.random() * scoutLaw.length);
  const correct = scoutLaw[correctIndex];
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
  if(choice === correct){
    feedback.textContent = 'Correct!';
  }else{
    feedback.textContent = `Oops! It\'s ${correct}.`;
  }
  setTimeout(nextQuestion, 1000);
}

startBtn.addEventListener('click', () => {
  startBtn.style.display = 'none';
  quiz.hidden = false;
  nextQuestion();
});
