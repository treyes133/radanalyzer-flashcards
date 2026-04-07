/* ================================================================
   RadAnalyzer Flashcards — v7
   All user-generated content is escaped via escapeHtml() before
   DOM insertion to prevent XSS.
   ================================================================ */

class FlashcardApp {
  constructor() {
    this.cards = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.showDefinitionsFirst = false;
    this.mode = 'study';
    this.lastShownCard = -1;
    this.debugMode = false;
    this.userPin = null;
    this.pendingCards = [];
    this.pendingUpdates = new Map();
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.searchQuery = '';

    this.initializeEventListeners();
    this.initKeyboardShortcuts();
    this.initSwipeGestures();
  }

  // ── Event Listeners ─────────────────────────────────────────

  initializeEventListeners() {
    // Login
    document.getElementById('loginBtn').addEventListener('click', () => this.login());
    document.getElementById('pinInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.login();
    });

    // Flashcard
    document.getElementById('flipBtn').addEventListener('click', (e) => { e.stopPropagation(); this.flipCard(); });
    document.getElementById('flashcard').addEventListener('click', () => this.flipCard());
    document.getElementById('prevBtn').addEventListener('click', () => this.previousCard());
    document.getElementById('nextBtn').addEventListener('click', () => this.nextCard());
    document.getElementById('toggleView').addEventListener('click', () => this.toggleView());
    document.getElementById('shuffleBtn').addEventListener('click', () => this.shuffleCards());
    document.getElementById('restartBtn').addEventListener('click', () => this.restart());

    // Modes
    document.getElementById('studyMode').addEventListener('click', () => this.setMode('study'));
    document.getElementById('endlessMode').addEventListener('click', () => this.setMode('endless'));
    document.getElementById('debugMode').addEventListener('click', () => this.setMode('debug'));

    // Confidence
    document.getElementById('thumbsUp').addEventListener('click', () => this.updateConfidence(true));
    document.getElementById('thumbsDown').addEventListener('click', () => this.updateConfidence(false));
    document.getElementById('saveProgress').addEventListener('click', () => this.saveProgress());

    // Manage
    document.getElementById('manageBtn').addEventListener('click', () => this.showManageSection());
    document.getElementById('addCardBtn').addEventListener('click', () => this.addCard());
    document.getElementById('saveChanges').addEventListener('click', () => this.saveChanges());
    document.getElementById('backToCards').addEventListener('click', () => this.showFlashcardSection());
    document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

    // Search
    document.getElementById('searchCards').addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.renderCardList();
    });

    // Add card on Enter in definition field
    document.getElementById('newDefinition').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addCard();
    });
  }

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      // Don't trigger if on login screen
      if (!document.getElementById('loginSection').classList.contains('hidden')) return;

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          this.flipCard();
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          this.nextCard();
          break;
        case 'ArrowLeft':
        case 'h':
          e.preventDefault();
          this.previousCard();
          break;
        case 's':
          e.preventDefault();
          this.shuffleCards();
          break;
        case '1':
          if (this.isFlipped && (this.mode === 'endless' || this.mode === 'debug')) {
            e.preventDefault();
            this.updateConfidence(false);
          }
          break;
        case '2':
          if (this.isFlipped && (this.mode === 'endless' || this.mode === 'debug')) {
            e.preventDefault();
            this.updateConfidence(true);
          }
          break;
      }
    });
  }

  initSwipeGestures() {
    const card = document.getElementById('flashcard');

    card.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    card.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - this.touchStartX;
      const dy = e.changedTouches[0].screenY - this.touchStartY;

      // Only trigger if horizontal swipe is dominant and > 60px
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx > 0) {
          this.previousCard();
        } else {
          this.nextCard();
        }
      }
    }, { passive: true });
  }

  // ── Toast ───────────────────────────────────────────────────

  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = message;
    container.appendChild(el);

    setTimeout(() => {
      el.classList.add('leaving');
      el.addEventListener('animationend', () => el.remove());
    }, 2500);
  }

  // ── Login / Logout ──────────────────────────────────────────

  async login() {
    const pin = document.getElementById('pinInput').value.trim();
    if (!pin) {
      this.toast('Please enter a code', 'error');
      return;
    }

    this.userPin = pin;
    document.getElementById('userPin').textContent = pin;

    try {
      await this.loadState();
    } catch (err) {
      // loadState handles its own fallback
    }

    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('appShell').classList.remove('hidden');

    if (this.cards.length > 0) {
      this.showFlashcardSection();
      this.displayCard();
      this.toast(`Loaded ${this.cards.length} cards`, 'success');
    } else {
      document.getElementById('flashcardSection').classList.add('hidden');
      document.getElementById('manageSection').classList.remove('hidden');
      this.pendingCards = [];
      this.renderCardList();
      this.updateStats();
      this.toast('No cards yet — add some to get started!', 'info');
    }
  }

  logout() {
    this.userPin = null;
    this.cards = [];
    this.currentIndex = 0;
    this.pendingUpdates.clear();
    document.getElementById('pinInput').value = '';
    document.getElementById('appShell').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
  }

  // ── Navigation ──────────────────────────────────────────────

  showFlashcardSection() {
    document.getElementById('flashcardSection').classList.remove('hidden');
    document.getElementById('manageSection').classList.add('hidden');
  }

  displayCard() {
    if (this.cards.length === 0) return;

    const card = this.cards[this.currentIndex];
    const cardText = document.getElementById('cardText');
    const cardLabel = document.getElementById('cardLabel');
    const flashcard = document.getElementById('flashcard');

    if (this.isFlipped) {
      cardText.textContent = this.showDefinitionsFirst ? card.word : card.definition;
      cardLabel.textContent = this.showDefinitionsFirst ? 'TERM' : 'DEFINITION';
      flashcard.classList.add('flipped');
    } else {
      cardText.textContent = this.showDefinitionsFirst ? card.definition : card.word;
      cardLabel.textContent = this.showDefinitionsFirst ? 'DEFINITION' : 'TERM';
      flashcard.classList.remove('flipped');
    }

    this.updateProgress();
    this.updateNavigationButtons();
    this.updateConfidenceButtons();
  }

  flipCard() {
    if (this.cards.length === 0) return;
    this.isFlipped = !this.isFlipped;
    this.displayCard();
  }

  nextCard() {
    if (this.cards.length === 0) return;
    if (this.mode === 'study') {
      this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    } else {
      this.currentIndex = this.getRandomCardIndex();
    }
    this.isFlipped = false;
    this.displayCard();
  }

  previousCard() {
    if (this.cards.length === 0) return;
    if (this.mode === 'study') {
      this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
      this.isFlipped = false;
      this.displayCard();
    }
  }

  shuffleCards() {
    if (this.cards.length <= 1) return;
    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    this.currentIndex = 0;
    this.isFlipped = false;
    this.displayCard();

    const btn = document.getElementById('shuffleBtn');
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 600);
    this.toast('Cards shuffled', 'info');
  }

  getRandomCardIndex() {
    if (this.cards.length <= 1) return 0;

    const weights = this.cards.map(card => Math.max(0.1, 1 - card.confidence));
    let available = weights.map((_, i) => i).filter(i => i !== this.lastShownCard);
    if (available.length === 0) available = weights.map((_, i) => i);

    const availWeights = available.map(i => weights[i]);
    const total = availWeights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;

    for (let i = 0; i < available.length; i++) {
      r -= availWeights[i];
      if (r <= 0) {
        this.lastShownCard = this.currentIndex;
        return available[i];
      }
    }
    this.lastShownCard = this.currentIndex;
    return available[available.length - 1];
  }

  // ── Confidence ──────────────────────────────────────────────

  async updateConfidence(isCorrect) {
    const card = this.cards[this.currentIndex];

    if (isCorrect) {
      card.correctCount++;
      card.confidence = Math.min(1, card.confidence + 0.1);
    } else {
      card.incorrectCount++;
      card.confidence = Math.max(0, card.confidence - 0.15);
    }

    if (this.mode === 'endless' || this.mode === 'debug') {
      this.pendingUpdates.set(card.id, card);
      setTimeout(() => this.nextCard(), 400);
    } else {
      await this.saveState();
    }
  }

  // ── View Controls ───────────────────────────────────────────

  toggleView() {
    this.showDefinitionsFirst = !this.showDefinitionsFirst;
    const btn = document.getElementById('toggleView');
    btn.title = this.showDefinitionsFirst ? 'Show terms first' : 'Show definitions first';
    btn.classList.toggle('active', this.showDefinitionsFirst);
    this.isFlipped = false;
    this.displayCard();
    this.toast(this.showDefinitionsFirst ? 'Showing definitions first' : 'Showing terms first', 'info');
  }

  restart() {
    this.currentIndex = 0;
    this.isFlipped = false;
    this.displayCard();
    this.toast('Restarted', 'info');
  }

  async setMode(mode) {
    const wasEndless = this.mode === 'endless' || this.mode === 'debug';

    if (wasEndless && mode === 'study' && this.pendingUpdates.size > 0) {
      await this.saveProgress();
    }

    this.mode = mode;
    this.debugMode = mode === 'debug';

    // Update toggle buttons
    document.querySelectorAll('.mode-toggle__btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Move indicator
    this.updateModeIndicator();

    // Toggle UI elements
    const prevBtn = document.getElementById('prevBtn');
    const progress = document.getElementById('progress');
    const saveBtn = document.getElementById('saveProgress');
    const shuffleBtn = document.getElementById('shuffleBtn');

    if (mode === 'endless' || mode === 'debug') {
      prevBtn.style.display = 'none';
      progress.style.display = 'none';
      saveBtn.classList.remove('hidden');
      shuffleBtn.style.display = 'none';
      this.currentIndex = this.getRandomCardIndex();
    } else {
      prevBtn.style.display = '';
      progress.style.display = '';
      saveBtn.classList.add('hidden');
      shuffleBtn.style.display = '';
    }

    this.isFlipped = false;
    this.displayCard();
  }

  updateModeIndicator() {
    const toggle = document.querySelector('.mode-toggle');
    const indicator = toggle.querySelector('.mode-toggle__indicator');
    const buttons = toggle.querySelectorAll('.mode-toggle__btn');
    const visibleButtons = [...buttons].filter(b => b.style.display !== 'none');
    let activeIdx = visibleButtons.findIndex(b => b.classList.contains('active'));
    if (activeIdx < 0) activeIdx = 0;
    indicator.style.width = `calc(${100 / visibleButtons.length}% - 3px)`;
    indicator.style.transform = `translateX(calc(${activeIdx * 100}% + ${activeIdx * 3}px))`;
  }

  // ── Progress & UI ───────────────────────────────────────────

  updateProgress() {
    if (this.mode === 'study') {
      document.getElementById('progress').textContent = `${this.currentIndex + 1} / ${this.cards.length}`;
    }
  }

  updateNavigationButtons() {
    document.getElementById('prevBtn').disabled = false;
    document.getElementById('nextBtn').disabled = false;
  }

  updateConfidenceButtons() {
    const confidenceButtons = document.getElementById('confidenceButtons');
    const debugInfo = document.getElementById('debugInfo');
    const saveBtn = document.getElementById('saveProgress');

    if ((this.mode === 'endless' || this.mode === 'debug') && this.isFlipped) {
      confidenceButtons.classList.remove('hidden');
      if (this.mode === 'debug') {
        debugInfo.classList.remove('hidden');
        this.updateDebugInfo();
      } else {
        debugInfo.classList.add('hidden');
      }
    } else {
      confidenceButtons.classList.add('hidden');
      debugInfo.classList.add('hidden');
    }

    if (saveBtn && this.pendingUpdates.size > 0) {
      saveBtn.textContent = `Save Progress (${this.pendingUpdates.size})`;
    }
  }

  updateDebugInfo() {
    const card = this.cards[this.currentIndex];
    const currentProb = this.getCardProbability(this.currentIndex);
    const upConf = Math.min(1, card.confidence + 0.1);
    const downConf = Math.max(0, card.confidence - 0.15);
    const upProb = this.calculateProbability(upConf);
    const downProb = this.calculateProbability(downConf);

    const debugText = document.getElementById('debugText');
    debugText.textContent = '';

    const parts = [
      `Prob: ${(currentProb * 100).toFixed(1)}%`,
      `Easy: ${(upProb * 100).toFixed(1)}% (${upConf.toFixed(2)})`,
      `Hard: ${(downProb * 100).toFixed(1)}% (${downConf.toFixed(2)})`
    ];
    debugText.textContent = parts.join(' | ');
  }

  getCardProbability(cardIndex) {
    const weights = this.cards.map(c => Math.max(0.1, 1 - c.confidence));
    const total = weights.reduce((s, w) => s + w, 0);
    return weights[cardIndex] / total;
  }

  calculateProbability(confidence) {
    const weight = Math.max(0.1, 1 - confidence);
    const others = this.cards.map((c, i) => {
      if (i === this.currentIndex) return weight;
      return Math.max(0.1, 1 - c.confidence);
    });
    const total = others.reduce((s, w) => s + w, 0);
    return weight / total;
  }

  // ── Stats ───────────────────────────────────────────────────

  updateStats() {
    const cards = this.pendingCards.length ? this.pendingCards : this.cards;
    const total = cards.length;
    const mastered = cards.filter(c => c.confidence >= 0.8).length;
    const learning = cards.filter(c => c.confidence > 0.3 && c.confidence < 0.8).length;
    const newCards = cards.filter(c => c.confidence <= 0.3).length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statMastered').textContent = mastered;
    document.getElementById('statLearning').textContent = learning;
    document.getElementById('statNew').textContent = newCards;
  }

  // ── Data Persistence ────────────────────────────────────────

  async loadState() {
    try {
      const response = await fetch(`/api/cards/${this.userPin}`);
      if (!response.ok) throw new Error('API error');
      this.cards = await response.json();
    } catch {
      const saved = localStorage.getItem(`flashcards_${this.userPin}`);
      this.cards = saved ? JSON.parse(saved) : [];
    }
  }

  async saveState() {
    try {
      await fetch(`/api/cards/${this.userPin}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.cards)
      });
    } catch {
      localStorage.setItem(`flashcards_${this.userPin}`, JSON.stringify(this.cards));
    }
  }

  // ── Manage Section ──────────────────────────────────────────

  async showManageSection() {
    if (this.pendingUpdates.size > 0) {
      await this.saveProgress();
    }
    document.getElementById('flashcardSection').classList.add('hidden');
    document.getElementById('manageSection').classList.remove('hidden');
    this.pendingCards = [...this.cards];
    this.searchQuery = '';
    document.getElementById('searchCards').value = '';
    this.renderCardList();
    this.updateStats();
  }

  addCard() {
    const wordEl = document.getElementById('newWord');
    const defEl = document.getElementById('newDefinition');
    const word = wordEl.value.trim();
    const definition = defEl.value.trim();

    if (!word || !definition) {
      this.toast('Both term and definition are required', 'error');
      return;
    }

    this.pendingCards.push({
      id: Date.now(),
      word,
      definition,
      confidence: 0.5,
      correctCount: 0,
      incorrectCount: 0
    });

    wordEl.value = '';
    defEl.value = '';
    wordEl.focus();
    this.renderCardList();
    this.updateStats();
    this.toast('Card added', 'success');
  }

  removeCard(id) {
    this.pendingCards = this.pendingCards.filter(c => c.id !== id);
    this.renderCardList();
    this.updateStats();
  }

  async saveChanges() {
    this.cards = [...this.pendingCards];
    if (this.cards.length === 0) {
      this.toast('Add at least one card before saving', 'error');
      return;
    }
    await this.saveState();
    if (this.currentIndex >= this.cards.length) this.currentIndex = 0;
    this.showFlashcardSection();
    this.displayCard();
    this.toast(`Saved ${this.cards.length} cards`, 'success');
  }

  async saveProgress() {
    if (this.pendingUpdates.size === 0) return;

    this.pendingUpdates.forEach((updatedCard, id) => {
      const idx = this.cards.findIndex(c => c.id === id);
      if (idx !== -1) this.cards[idx] = updatedCard;
    });

    await this.saveState();
    const count = this.pendingUpdates.size;
    this.pendingUpdates.clear();
    this.updateConfidenceButtons();
    this.toast(`Progress saved (${count} updates)`, 'success');
  }

  renderCardList() {
    const cardList = document.getElementById('cardList');
    let filtered = this.pendingCards;

    if (this.searchQuery) {
      filtered = filtered.filter(c =>
        c.word.toLowerCase().includes(this.searchQuery) ||
        c.definition.toLowerCase().includes(this.searchQuery)
      );
    }

    // Clear existing content
    cardList.textContent = '';

    if (filtered.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'card-list-empty';

      const iconDiv = document.createElement('div');
      iconDiv.className = 'card-list-empty__icon';
      iconDiv.textContent = this.searchQuery ? '🔍' : '📝';

      const msgP = document.createElement('p');
      msgP.textContent = this.searchQuery
        ? 'No cards match your search'
        : 'No cards yet. Add your first card above!';

      emptyDiv.appendChild(iconDiv);
      emptyDiv.appendChild(msgP);
      cardList.appendChild(emptyDiv);
      return;
    }

    filtered.forEach(card => {
      const pct = Math.round(card.confidence * 100);
      const color = pct >= 80 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';

      const item = document.createElement('div');
      item.className = 'card-item';

      const info = document.createElement('div');
      info.className = 'card-item__info';

      const wordDiv = document.createElement('div');
      wordDiv.className = 'card-item__word';
      wordDiv.textContent = card.word;

      const defDiv = document.createElement('div');
      defDiv.className = 'card-item__def';
      defDiv.textContent = card.definition;

      info.appendChild(wordDiv);
      info.appendChild(defDiv);

      const confDiv = document.createElement('div');
      confDiv.className = 'card-item__confidence';
      const confFill = document.createElement('div');
      confFill.className = 'card-item__confidence-fill';
      confFill.style.width = pct + '%';
      confFill.style.background = color;
      confDiv.appendChild(confFill);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'card-item__remove';
      removeBtn.title = 'Remove card';
      removeBtn.addEventListener('click', () => this.removeCard(card.id));

      const removeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      removeSvg.setAttribute('width', '14');
      removeSvg.setAttribute('height', '14');
      removeSvg.setAttribute('viewBox', '0 0 24 24');
      removeSvg.setAttribute('fill', 'none');
      removeSvg.setAttribute('stroke', 'currentColor');
      removeSvg.setAttribute('stroke-width', '2');
      removeSvg.setAttribute('stroke-linecap', 'round');
      removeSvg.setAttribute('stroke-linejoin', 'round');
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('x1', '18'); line1.setAttribute('y1', '6');
      line1.setAttribute('x2', '6'); line1.setAttribute('y2', '18');
      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line2.setAttribute('x1', '6'); line2.setAttribute('y1', '6');
      line2.setAttribute('x2', '18'); line2.setAttribute('y2', '18');
      removeSvg.appendChild(line1);
      removeSvg.appendChild(line2);
      removeBtn.appendChild(removeSvg);

      item.appendChild(info);
      item.appendChild(confDiv);
      item.appendChild(removeBtn);
      cardList.appendChild(item);
    });
  }
}

const app = new FlashcardApp();
