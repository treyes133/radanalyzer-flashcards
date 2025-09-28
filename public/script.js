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
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('csvFile').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('flipBtn').addEventListener('click', () => this.flipCard());
        document.getElementById('prevBtn').addEventListener('click', () => this.previousCard());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextCard());
        document.getElementById('toggleView').addEventListener('click', () => this.toggleView());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('studyMode').addEventListener('click', () => this.setMode('study'));
        document.getElementById('endlessMode').addEventListener('click', () => this.setMode('endless'));
        document.getElementById('debugMode').addEventListener('click', () => this.setMode('debug'));
        document.getElementById('thumbsUp').addEventListener('click', async () => await this.updateConfidence(true));
        document.getElementById('thumbsDown').addEventListener('click', async () => await this.updateConfidence(false));
        document.getElementById('manageBtn').addEventListener('click', () => this.showManageSection());
        document.getElementById('addCardBtn').addEventListener('click', () => this.addCard());
        document.getElementById('saveChanges').addEventListener('click', async () => await this.saveChanges());
        document.getElementById('backToCards').addEventListener('click', () => this.showFlashcardSection());
        document.getElementById('loginBtn').addEventListener('click', () => this.login());
        document.getElementById('pinInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            await this.parseCSV(e.target.result);
        };
        reader.readAsText(file);
    }

    async parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        
        // Show user's CSV content
        document.getElementById('csvContent').innerHTML = csvText.split('\n').slice(0, 5).map(line => 
            `<div style="margin-bottom: 2px;">${line}</div>`
        ).join('') + (lines.length > 5 ? '<div style="color: #666; font-style: italic;">... and more rows</div>' : '');
        document.getElementById('csvPreview').classList.remove('hidden');
        
        if (lines.length === 0) {
            this.showError('File is empty');
            document.getElementById('csvFile').value = '';
            return;
        }
        
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        if (!headers.includes('word') || !headers.includes('definition')) {
            this.showError('CSV file must have "word" and "definition" headers');
            document.getElementById('csvFile').value = '';
            return;
        }
        
        this.cards = lines.slice(1).map((line, index) => {
            const [word, definition] = line.split(',').map(item => item.trim().replace(/^"|"$/g, ''));
            return {
                id: index,
                word: word || '',
                definition: definition || '',
                confidence: 0.5,
                correctCount: 0,
                incorrectCount: 0
            };
        }).filter(card => card.word && card.definition);

        if (this.cards.length > 0) {
            this.hideError();
            await this.saveState();
            this.showFlashcardSection();
            this.currentIndex = 0;
            this.displayCard();
        } else {
            this.showError('No valid cards found in CSV file');
            document.getElementById('csvFile').value = '';
        }
    }

    showFlashcardSection() {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('uploadSection').classList.add('hidden');
        document.getElementById('manageSection').classList.add('hidden');
        document.getElementById('flashcardSection').classList.remove('hidden');
        document.querySelector('header').classList.remove('hidden');
    }

    displayCard() {
        if (this.cards.length === 0) return;

        const card = this.cards[this.currentIndex];
        const cardText = document.getElementById('cardText');
        
        if (this.isFlipped) {
            cardText.textContent = this.showDefinitionsFirst ? card.word : card.definition;
        } else {
            cardText.textContent = this.showDefinitionsFirst ? card.definition : card.word;
        }

        this.updateProgress();
        this.updateNavigationButtons();
        this.updateConfidenceButtons();
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        this.displayCard();
    }

    nextCard() {
        if (this.mode === 'study') {
            if (this.currentIndex < this.cards.length - 1) {
                this.currentIndex++;
            } else {
                this.currentIndex = 0;
            }
        } else {
            this.currentIndex = this.getRandomCardIndex();
        }
        this.isFlipped = false;
        this.displayCard();
    }

    previousCard() {
        if (this.mode === 'study') {
            if (this.currentIndex > 0) {
                this.currentIndex--;
            } else {
                this.currentIndex = this.cards.length - 1;
            }
            this.isFlipped = false;
            this.displayCard();
        }
    }

    getRandomCardIndex() {
        if (this.cards.length <= 1) return 0;

        const weights = this.cards.map(card => {
            const difficulty = 1 - card.confidence;
            return Math.max(0.1, difficulty);
        });

        let availableIndices = weights.map((_, index) => index)
            .filter(index => index !== this.lastShownCard);

        if (availableIndices.length === 0) {
            availableIndices = weights.map((_, index) => index);
        }

        const availableWeights = availableIndices.map(index => weights[index]);
        const totalWeight = availableWeights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < availableIndices.length; i++) {
            random -= availableWeights[i];
            if (random <= 0) {
                this.lastShownCard = this.currentIndex;
                return availableIndices[i];
            }
        }

        this.lastShownCard = this.currentIndex;
        return availableIndices[availableIndices.length - 1];
    }

    async updateConfidence(isCorrect) {
        const card = this.cards[this.currentIndex];
        
        if (isCorrect) {
            card.correctCount++;
            card.confidence = Math.min(1, card.confidence + 0.1);
        } else {
            card.incorrectCount++;
            card.confidence = Math.max(0, card.confidence - 0.15);
        }

        await this.saveState();
        if (this.mode === 'endless' || this.mode === 'debug') {
            setTimeout(() => this.nextCard(), 500);
        }
    }

    toggleView() {
        this.showDefinitionsFirst = !this.showDefinitionsFirst;
        const button = document.getElementById('toggleView');
button.title = this.showDefinitionsFirst ? 'Show Words First' : 'Show Definitions First';
        this.isFlipped = false;
        this.displayCard();
    }

    restart() {
        this.currentIndex = 0;
        this.isFlipped = false;
        this.displayCard();
    }

    setMode(mode) {
        this.mode = mode;
        this.debugMode = mode === 'debug';
        
        document.getElementById('studyMode').classList.toggle('active', mode === 'study');
        document.getElementById('endlessMode').classList.toggle('active', mode === 'endless');
        document.getElementById('debugMode').classList.toggle('active', mode === 'debug');
        
        const prevBtn = document.getElementById('prevBtn');
        const progress = document.getElementById('progress');
        
        if (mode === 'endless' || mode === 'debug') {
            prevBtn.style.display = 'none';
            progress.style.display = 'none';
            this.currentIndex = this.getRandomCardIndex();
        } else {
            prevBtn.style.display = 'block';
            progress.style.display = 'block';
        }
        
        this.isFlipped = false;
        this.displayCard();
    }

    updateProgress() {
        if (this.mode === 'study') {
            document.getElementById('progress').textContent = `${this.currentIndex + 1} / ${this.cards.length}`;
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (this.mode === 'study') {
            prevBtn.disabled = false;
            nextBtn.disabled = false;
        }
    }

    updateConfidenceButtons() {
        const confidenceButtons = document.getElementById('confidenceButtons');
        const debugInfo = document.getElementById('debugInfo');
        
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
    }

    updateDebugInfo() {
        const card = this.cards[this.currentIndex];
        const currentProb = this.getCardProbability(this.currentIndex);
        
        const upConfidence = Math.min(1, card.confidence + 0.1);
        const downConfidence = Math.max(0, card.confidence - 0.15);
        
        const upProb = this.calculateProbability(upConfidence);
        const downProb = this.calculateProbability(downConfidence);
        
        document.getElementById('debugText').innerHTML = `
            <strong>Current:</strong> ${(currentProb * 100).toFixed(1)}% probability<br>
            <strong>👍 Easy:</strong> ${(upProb * 100).toFixed(1)}% (confidence: ${upConfidence.toFixed(2)})<br>
            <strong>👎 Hard:</strong> ${(downProb * 100).toFixed(1)}% (confidence: ${downConfidence.toFixed(2)})
        `;
    }

    getCardProbability(cardIndex) {
        const weights = this.cards.map(card => {
            const difficulty = 1 - card.confidence;
            return Math.max(0.1, difficulty);
        });
        
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        return weights[cardIndex] / totalWeight;
    }

    calculateProbability(confidence) {
        const difficulty = 1 - confidence;
        const weight = Math.max(0.1, difficulty);
        
        const otherWeights = this.cards.map((card, index) => {
            if (index === this.currentIndex) return weight;
            const otherDifficulty = 1 - card.confidence;
            return Math.max(0.1, otherDifficulty);
        });
        
        const totalWeight = otherWeights.reduce((sum, w) => sum + w, 0);
        return weight / totalWeight;
    }

    async loadState() {
        try {
            const response = await fetch(`/api/cards/${this.userPin}`);
            this.cards = await response.json();
        } catch (error) {
            console.log('Loading from localStorage as fallback');
            const saved = localStorage.getItem(`flashcards_${this.userPin}`);
            if (saved) {
                this.cards = JSON.parse(saved);
            } else {
                this.cards = [];
            }
        }
    }

    async saveState() {
        try {
            await fetch(`/api/cards/${this.userPin}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.cards)
            });
        } catch (error) {
            localStorage.setItem(`flashcards_${this.userPin}`, JSON.stringify(this.cards));
        }
    }

    showManageSection() {
        document.getElementById('flashcardSection').classList.add('hidden');
        document.getElementById('manageSection').classList.remove('hidden');
        this.pendingCards = [...this.cards];
        this.renderCardList();
    }

    async login() {
        const pin = document.getElementById('pinInput').value;
        if (!pin) return;
        
        this.userPin = pin;
        document.getElementById('userPin').textContent = pin;
        await this.loadState();
        
        if (this.cards.length > 0) {
            this.showFlashcardSection();
            this.displayCard();
        } else {
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('uploadSection').classList.remove('hidden');
            document.querySelector('header').classList.remove('hidden');
        }
    }

    addCard() {
        const word = document.getElementById('newWord').value.trim();
        const definition = document.getElementById('newDefinition').value.trim();
        
        if (word && definition) {
            this.pendingCards.push({
                id: Date.now(),
                word,
                definition,
                confidence: 0.5,
                correctCount: 0,
                incorrectCount: 0
            });
            
            document.getElementById('newWord').value = '';
            document.getElementById('newDefinition').value = '';
            this.renderCardList();
        }
    }

    removeCard(id) {
        this.pendingCards = this.pendingCards.filter(card => card.id !== id);
        this.renderCardList();
    }
    
    async saveChanges() {
        this.cards = [...this.pendingCards];
        await this.saveState();
        
        if (this.cards.length === 0) {
            document.getElementById('manageSection').classList.add('hidden');
            document.getElementById('uploadSection').classList.remove('hidden');
        } else {
            if (this.currentIndex >= this.cards.length) {
                this.currentIndex = 0;
            }
            this.showFlashcardSection();
            this.displayCard();
        }
    }

    renderCardList() {
        const cardList = document.getElementById('cardList');
        cardList.innerHTML = this.pendingCards.map(card => `
            <div class="card-item">
                <div class="card-info">
                    <strong>${card.word}</strong> - ${card.definition}
                </div>
                <button class="remove-btn" onclick="app.removeCard(${card.id})">✖</button>
            </div>
        `).join('');
    }
    
    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
    
    hideError() {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.classList.add('hidden');
    }
}

const app = new FlashcardApp();