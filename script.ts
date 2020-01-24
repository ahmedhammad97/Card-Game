interface Card {
    digit: number; // {1, 2, 3, 4, 5, 6, 7, 8}
    color: string; // {'red', 'green', 'blue', 'yellow'}
}

abstract class Player {
    private cards: Array<Card>;
    protected game: Game;

    constructor(game: Game) {
        this.game = game;
        this.cards = [];
    }

    public abstract playTurn();

    protected scanCards(currentCard: Card): Array<number> {
        let validCards = [];
        for (let i = 0; i < this.cards.length; i++) {
            if (this.isValid(currentCard, this.cards[i])) {
                validCards.push(i);
            }
        }
        return validCards;
    }

    playCard(index: number) {
        let toPlayCard = this.cards[index];
        this.cards.splice(index, 1);
        this.game.addCardToGround(toPlayCard);
        
        if (this.didWin) this.game.announceWinner();
    }

    drawCard () {
        let newCard = this.game.drawCardFromDeck();
        this.cards.push(newCard);
    }

    didWin(): boolean {
        return this.cards.length === 0;
    }

    private isValid(firstCard: Card, secondCard: Card): boolean {
        return (firstCard.digit === secondCard.digit) || (firstCard.color === secondCard.color)
    }
}

class HumanPlayer extends Player {
    playTurn() {
        let currCard: Card = this.game.getCurrCard();
        let possibleCards: Array<number> = this.scanCards(currCard);
        if (possibleCards.length === 0) this.highlightDeck();
        else this.highlightPossibleCards()
    }

    playCard(index: number) {
        this.dimPossibleCards();
        super.playCard(index);
    }

    drawCard() {
        this.dimDeck();
        super.drawCard();
    }

    private highlightPossibleCards() {

    }

    private highlightDeck() {

    }

    private dimPossibleCards() {

    }

    private dimDeck() {

    }


}

class ComputerPlayer extends Player {
    playTurn() {
        let currCard: Card = this.game.getCurrCard();
        let possibleCards: Array<number> = this.scanCards(currCard);
        if (possibleCards.length === 0) this.drawCard();
        else this.playCard(0);
    }
}

class Game {
    private state: string;
    private deck: Array<Card>;
    private ground: Array<Card>;
    private humanPlayer: HumanPlayer;
    private computerPlayer: ComputerPlayer;

    constructor() {
        this.humanPlayer = new HumanPlayer(this);
        this.computerPlayer = new ComputerPlayer(this);
        this.deck = [];
        this.ground = [];
        this.state = "running";

        this.fillDeck();
        this.shuffleDeck();
        this.insertToGround(this.deck.pop());
        this.setupEventListeners();
    }

    public startGame() {
        this.drawInitialCards();

        while (this.state !== "end") {
            this.humanPlayer.playTurn();
            this.computerPlayer.playTurn();
        }
    }

    private setupEventListeners() {
        document.querySelector("#curtain").addEventListener('click', function() {
            document.getElementById("curtain").style.display = "none";
        });

        document.querySelector(".deck .cardBack").addEventListener('click', function() {
            alert("Human drew card");
        });

        document.querySelectorAll(".humanArea .cardFront").forEach(function(card) {
            card.addEventListener('click', function() {
                alert("Wooo");
            });
        });
    }

    private drawInitialCards() {
        for (let i = 0; i < 4; i++) {
            this.humanPlayer.drawCard();
            this.computerPlayer.drawCard();
        }
    }

    private fillDeck() {
        let colors = ['red', 'green', 'blue', 'yellow'];
        for (let i = 0; i < 4; i++) {
            for (let j = 1; j < 9; j++) {
                this.deck.push({digit: j, color: colors[i]})
            }
        }
    }

    protected shuffleDeck() {
        this.deck.sort( () => Math.random() - 0.5);
    }

    public insertToGround(card: Card) {
        this.ground.push(card);
    }

    public getCurrCard(): Card {
        return this.ground[this.ground.length - 1];
    }

    public addCardToGround(card: Card) {
        this.ground.push(card);
    }

    public drawCardFromDeck(): Card {
        if (this.deck.length === 0) {
            this.moveGroundToDeck();
        }
        let newCard = this.deck.pop();
        return newCard;
    }

    private moveGroundToDeck() {
        let currCard = this.ground.pop();
        while(this.ground.length > 0) {
            this.deck.push(this.ground.pop());
        }
        this.shuffleDeck();
        this.ground.push(currCard);
    }

    public announceWinner() {
        alert("Hooray!");
        this.state = "end";
    }
}

let game = new Game();