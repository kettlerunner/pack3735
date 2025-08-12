// Twelve points of the Scout Law and their meanings
const scoutLawDetails = {
  Trustworthy: "A Scout tells the truth and can be relied upon.",
  Loyal: "A Scout is faithful to their family, friends, leaders, and country.",
  Helpful: "A Scout is willing to assist others.",
  Friendly: "A Scout is a friend to all.",
  Courteous: "A Scout is polite and considerate.",
  Kind: "A Scout is gentle and considerate of others.",
  Obedient: "A Scout follows rules and laws.",
  Cheerful: "A Scout is optimistic and positive.",
  Thrifty: "A Scout uses resources wisely.",
  Brave: "A Scout faces challenges with courage.",
  Clean: "A Scout keeps their body and mind fit and clean.",
  Reverent: "A Scout is respectful of their faith and others' beliefs."
};

const scoutLaw = Object.keys(scoutLawDetails);

// A pool of incorrect answers to mix with the real points of the Scout Law
const wrongAnswers = [
  "Adventurous","Bold","Creative","Curious","Determined","Energetic",
  "Generous","Honest","Imaginative","Patient","Punctual","Silly",
  "Strong","Talented","Witty","Zany","Brilliant","Calm","Fearless","Speedy",
  "Ambitious","Caring","Confident","Daring","Eager","Efficient",
  "Forgiving","Gracious","Inventive","Jolly","Keen","Lively",
  "Merry","Neat","Optimistic","Polite","Quick","Resourceful",
  "Sincere","Tidy","Understanding","Valiant","Wise","Xenial",
  "Youthful","Zealous",
  // Added:
  "Accountable","Adaptable","Affable","Alert","Altruistic","Approachable",
  "Attentive","Balanced","Benevolent","Cautious","Civic-Minded","Committed",
  "Compassionate","Composed","Conscientious","Considerate","Constructive",
  "Cooperative","Courageous","Decisive","Dependable","Diligent","Discreet",
  "Disciplined","Devoted","Devout","Diplomatic","Earnest","Empathetic",
  "Encouraging","Enterprising","Ethical","Even-Tempered","Fair","Fair-Minded",
  "Faithful","Focused","Frugal","Gallant","Gentle","Genuine","Grateful",
  "Hardworking","Honorable","Humble","Humorous","Impartial","Inclusive",
  "Independent","Industrious","Inquisitive","Insightful","Intrepid","Just",
  "Law-Abiding","Level-Headed","Magnanimous","Methodical","Modest","Noble",
  "Observant","Open-Minded","Orderly","Organized","Peaceful","Persevering",
  "Persistent","Playful","Positive","Practical","Prepared","Principled",
  "Proactive","Productive","Protective","Prudent","Quick-Witted","Reliable",
  "Respectful","Responsible","Responsive","Self-Controlled","Self-Reliant",
  "Selfless","Sociable","Spirited","Steadfast","Supportive","Tactful",
  "Temperate","Thoughtful","Thorough","Truthful","Unassuming","Upbeat",
  "Vigilant","Welcoming","Well-Mannered"
];

const startBtn = document.getElementById('startBtn');
const quiz = document.getElementById('quiz');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedback = document.getElementById('feedback');
const progress = document.getElementById('progress');
const timer = document.getElementById('timer');
const timerBar = document.getElementById('timerBar');

const WAIT_TIME = 5000; // ms delay before next question

let remaining = [];
let score = 0;
let qNum = 0;

function nextQuestion(){
  feedback.textContent = '';
  timer.style.visibility = 'hidden';
  timerBar.style.transition = 'none';
  timerBar.style.width = '0%';
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
    opts.add(wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)]);
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
  const desc = scoutLawDetails[correct];
  if(choice === correct){
    feedback.textContent = `Correct! ${correct}: ${desc}`;
    score++;
  }else{
    feedback.textContent = `Oops! It's ${correct}: ${desc}`;
  }
  timer.style.visibility = 'visible';
  timerBar.style.transition = 'none';
  timerBar.style.width = '0%';
  timerBar.offsetWidth; // force reflow
  timerBar.style.transition = `width ${WAIT_TIME}ms linear`;
  timerBar.style.width = '100%';
  setTimeout(nextQuestion, WAIT_TIME);
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
