/**
 * The game logic has been built using 5 entities:
 * 
 * 1- Card Interface:
 * A wrapper for a card object.
 * Ex. {digit: 5, color: 'blue'}
 * 
 * 2- Player Class:
 * An abstract class that contains the common
 * attributes and functionalities between both human,
 * and computer players.
 * 
 * 3- HumanPlayer Class:
 * Its functionality is split into two parts:
 * - Automated functionalities, that highlights cards,
 *   and update the model cards, etc.
 * - Event-driven functionalities, that are only invoked when
 *   the user himself fires an event (mouse click).
 * 
 * 4- ComputerPlayer Class:
 * Completely automated functionalities that does its job
 * without waiting for user interaction.
 * 
 * 5- Game Class:
 * The main class that controls all the previously mentioned entites.
 * It's responsible for all the interaction between the players, deck, and ground,
 * and responsible for listening to the user events, handling them, and for
 * rendering the cards to view after every update. 
 */


interface Card {
    digit: number; // {1, 2, 3, 4, 5, 6, 7, 8}
    color: string; // {'red', 'lime', 'blue', 'yellow'}
}


abstract class Player {
    private cards: Array<Card>;
    private game: Game;

    constructor() {
        this.cards = [];
    }

    public setGame(game) {
        this.game = game;
    }

    public abstract playTurn(): void;

    public playCard(index: number) {
        let toPlayCard: Card = this.cards[index];
        this.cards.splice(index, 1);
        this.game.insertToGround(toPlayCard);
        
        if (this.didWin()) this.game.announceWinner();
    }

    public drawCard () {
        let newCard: Card = this.game.drawCardFromDeck();
        this.cards.push(newCard);
    }

    public didWin(): boolean {
        return this.cards.length === 0;
    }

    public clearCards() {
        this.cards = [];
    }

    public getCardsInHand(): Array<Card> {
        return this.cards;
    }

    // Scans all the cards in hand, and returns a list of valid cards to play
    protected scanCards(currentCard: Card): Array<number> {
        let validCards: Array<number> = [];
        for (let i = 0; i < this.cards.length; i++) {
            if (this.isValid(currentCard, this.cards[i])) {
                validCards.push(i);
            }
        }
        return validCards;
    }

    protected getGameCurrCard(): Card {
        return this.game.getCurrCard();
    }

    protected setGameState(state: string) {
        this.game.setGameState(state);
    }

    // Checks if a card is valid to play
    private isValid(firstCard: Card, secondCard: Card): boolean {
        return (firstCard.digit === secondCard.digit) ||
        (firstCard.color === secondCard.color)
    }
}


class HumanPlayer extends Player {
    public playTurn() {
        let currCard: Card = this.getGameCurrCard();
        let possibleCards: Array<number> = this.scanCards(currCard);
        if (possibleCards.length === 0) this.highlightDeck();
        else this.highlightPossibleCards(possibleCards);
    }

    public playCard(index: number) {
        this.dimPossibleCards();
        super.playCard(index);
    }

    public drawCard() {
        this.dimDeck();
        super.drawCard();
    }

    private highlightPossibleCards(possibleCards: Array<number>) {
        this.setGameState("play");
        let cardList: HTMLCollection;
        cardList = document.querySelector(".humanArea .cards").children;
        possibleCards.forEach(card => {
            cardList[card].classList.add("raise");
        })
        
    }

    private highlightDeck() {
        this.setGameState("draw");
        let deck: HTMLElement = document.querySelector(".deck .cardBack");
        deck.classList.add("glow");
    }

    private dimPossibleCards() {
        let cardList: HTMLCollection;
        cardList = document.querySelector(".humanArea .cards").children;
        for (let i = 0; i < cardList.length; i++) {
            cardList[i].classList.remove("raise");
        }
    }

    private dimDeck() {
        let deck: HTMLElement = document.querySelector(".deck .cardBack");
        deck.classList.remove("glow");
    }
}


class ComputerPlayer extends Player {
    playTurn() {
        let currCard: Card = this.getGameCurrCard();
        let possibleCards: Array<number> = this.scanCards(currCard);
        if (possibleCards.length === 0) this.drawCard();
        else this.playCard(possibleCards[0]);
    }
}


class Game {
    private state: string;
    private deck: Array<Card>;
    private ground: Array<Card>;
    private humanPlayer: Player;
    private computerPlayer: Player;

    constructor(humanPlayer: Player, computerPlayer: Player) {
        this.humanPlayer = humanPlayer;
        this.humanPlayer.setGame(this);
        this.computerPlayer = computerPlayer;
        this.computerPlayer.setGame(this);

        this.deck = [];
        this.ground = [];
        this.state = "start";

        this.setupCurtainListener();
        this.setupDeckListener();
    }

    public startGame() {
        this.humanPlayer.clearCards();
        this.computerPlayer.clearCards();
        this.clearGround();
        this.clearDeck();

        this.fillDeck();
        this.shuffleDeck();
        this.insertToGround(this.deck.pop());

        this.drawInitialCards();
        this.renderCards();
        
        this.humanPlayer.playTurn();
    }

    public getGameState(): string {
        return this.state;
    }

    public setGameState(state: string) {
        this.state = state;
    }

    public insertToGround(card: Card) {
        this.ground.push(card);
    }

    public getCurrCard(): Card {
        return this.ground[this.ground.length - 1];
    }

    public drawCardFromDeck(): Card {
        if (this.deck.length === 0) {
            this.moveGroundToDeck();
        }
        let newCard = this.deck.pop();
        return newCard;
    }

    public announceWinner() {
        setTimeout(() => {
            let curtain: HTMLElement = document.querySelector("#curtain");
            let startBtn: HTMLElement = document.querySelector("#curtain button");
            let heading: HTMLElement = document.querySelector("#curtain h1");

            if (this.humanPlayer.didWin())
                heading.innerHTML = "You Won! Hooraaay";
            else heading.innerHTML = "Better Luck next time";
            
            startBtn.innerHTML = "Restart?";
            curtain.style.display = 'block';
        } , 1000);
        this.setGameState("end");
    }

    private setupCurtainListener() {
        document.querySelector("#curtain button")
        .addEventListener('click', function() {
            document.getElementById("curtain").style.display = "none";
            game.startGame();
        });
    }

    private setupDeckListener() {
        document.querySelector(".deck .cardBack")
        .addEventListener('click', function() {
            if (game.getGameState() === "draw"){
                game.humanPlayer.drawCard();
                game.completeTurn();
            }
        });
    }

    private setupHumanCardListener() {
        document.querySelectorAll(".humanArea .cardFront")
        .forEach(function(card) {
            card.addEventListener('click', game.humanCardHandler);
        });
    }

    private humanCardHandler(event: Event) {
        if (game.getGameState() === "play") {
            let selectedCard: HTMLElement = (event.target as HTMLElement);
            if (selectedCard.parentElement.classList.contains("raise")) {
                let index: number;
                index = parseInt(selectedCard.getAttribute("index"));
                game.humanPlayer.playCard(index);
                game.completeTurn();
            }
        }
    }

    private completeTurn() {
        this.renderCards();
        if(game.humanPlayer.didWin()) return;
        this.setGameState("computer");
        setTimeout(() => {
            game.computerPlayer.playTurn();
            game.renderCards();
            game.humanPlayer.playTurn();
        }, 1000);
    }

    private drawInitialCards() {
        for (let i = 0; i < 4; i++) {
            this.humanPlayer.drawCard();
            this.computerPlayer.drawCard();
        }
    }

    private renderCards() {
        let computerCardsCount = this.computerPlayer.getCardsInHand().length;
        let humanCards = this.humanPlayer.getCardsInHand();
        let groundCard = this.ground[this.ground.length - 1];

        this.updateGroundCard(groundCard);
        this.updateComputerCards(computerCardsCount);
        this.updateHumanCards(humanCards);

        this.setupHumanCardListener();
    }

    private updateGroundCard(groundCard: Card) {
        let groundCardElement: HTMLElement;
        groundCardElement = document.querySelector(".ground .cardFront");
        let strDigit: string = groundCard.digit.toString();
        let cardTag: string = `<span class="digit">${strDigit}</span>`;
        groundCardElement.innerHTML = cardTag;
        groundCardElement.style.backgroundColor = groundCard.color;
    }

    private updateComputerCards(computerCardsCount: number) {
        let computerCardList: HTMLElement;
        computerCardList = document.querySelector(".computerArea .cards");
        computerCardList.innerHTML = '';

        for (let i = 0; i < computerCardsCount; i++) {
            let backCard = `<li><div class="cardBack"></div></li>`;
            computerCardList.innerHTML += backCard;
        }
    }

    private updateHumanCards(humanCards: Array<Card>) {
        let computerCardList: HTMLElement;
        computerCardList = document.querySelector(".humanArea .cards");
        computerCardList.innerHTML = '';

        for (let i = 0; i < humanCards.length; i++) {
            let digit = humanCards[i].digit;
            let color = humanCards[i].color;
            let frontCard = `<li><div class="cardFront" index="${i}" 
            style="background-color:${color};">
            <span class="digit">${digit}</span>
            </div></li>`;
            computerCardList.innerHTML += frontCard;
        }
    }

    private clearGround() {
        this.ground = [];
    }

    private clearDeck() {
        this.deck = [];
    }

    private fillDeck() {
        let colors = ['red', 'lime', 'blue', 'yellow'];
        for (let i = 0; i < 4; i++) {
            for (let j = 1; j < 9; j++) {
                this.deck.push({digit: j, color: colors[i]})
            }
        }
    }

    private shuffleDeck() {
        // Sorting the deck with a fairly random criteria (50%)
        for (let i = 0; i < 5; i++) {
            this.deck.sort( () => Math.random() - 0.5);
        }
    }

    private moveGroundToDeck() {
        if(this.ground.length < 2) alert("No more cards!");
        else {
            let currCard = this.ground.pop();
            while(this.ground.length > 0) {
                this.deck.push(this.ground.pop());
            }
            this.shuffleDeck();
            this.ground.push(currCard);
        }
    }
}

let humanPlayer = new HumanPlayer();
let computerPlayer = new ComputerPlayer();
let game = new Game(humanPlayer, computerPlayer);