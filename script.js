var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Player = /** @class */ (function () {
    function Player(game) {
        this.game = game;
        this.cards = [];
    }
    Player.prototype.scanCards = function (currentCard) {
        var validCards = [];
        for (var i = 0; i < this.cards.length; i++) {
            if (this.isValid(currentCard, this.cards[i])) {
                validCards.push(i);
            }
        }
        return validCards;
    };
    Player.prototype.playCard = function (index) {
        var toPlayCard = this.cards[index];
        this.cards.splice(index, 1);
        this.game.addCardToGround(toPlayCard);
        if (this.didWin)
            this.game.announceWinner();
    };
    Player.prototype.drawCard = function () {
        var newCard = this.game.drawCardFromDeck();
        this.cards.push(newCard);
    };
    Player.prototype.didWin = function () {
        return this.cards.length === 0;
    };
    Player.prototype.isValid = function (firstCard, secondCard) {
        return (firstCard.digit === secondCard.digit) || (firstCard.color === secondCard.color);
    };
    return Player;
}());
var HumanPlayer = /** @class */ (function (_super) {
    __extends(HumanPlayer, _super);
    function HumanPlayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HumanPlayer.prototype.playTurn = function () {
        var currCard = this.game.getCurrCard();
        var possibleCards = this.scanCards(currCard);
        if (possibleCards.length === 0)
            this.highlightDeck();
        else
            this.highlightPossibleCards();
    };
    HumanPlayer.prototype.playCard = function (index) {
        this.dimPossibleCards();
        _super.prototype.playCard.call(this, index);
    };
    HumanPlayer.prototype.drawCard = function () {
        this.dimDeck();
        _super.prototype.drawCard.call(this);
    };
    HumanPlayer.prototype.highlightPossibleCards = function () {
    };
    HumanPlayer.prototype.highlightDeck = function () {
    };
    HumanPlayer.prototype.dimPossibleCards = function () {
    };
    HumanPlayer.prototype.dimDeck = function () {
    };
    return HumanPlayer;
}(Player));
var ComputerPlayer = /** @class */ (function (_super) {
    __extends(ComputerPlayer, _super);
    function ComputerPlayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ComputerPlayer.prototype.playTurn = function () {
        var currCard = this.game.getCurrCard();
        var possibleCards = this.scanCards(currCard);
        if (possibleCards.length === 0)
            this.drawCard();
        else
            this.playCard(0);
    };
    return ComputerPlayer;
}(Player));
var Game = /** @class */ (function () {
    function Game() {
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
    Game.prototype.startGame = function () {
        this.drawInitialCards();
        while (this.state !== "end") {
            this.humanPlayer.playTurn();
            this.computerPlayer.playTurn();
        }
    };
    Game.prototype.setupEventListeners = function () {
        document.querySelector("#curtain").addEventListener('click', function () {
            document.getElementById("curtain").style.display = "none";
        });
        document.querySelector(".deck .cardBack").addEventListener('click', function () {
            //this.humanPlayer.drawCard();
            alert("Human drew card");
        });
        document.querySelectorAll(".humanArea .cardFront").forEach(function (card) {
            card.addEventListener('click', function () {
                alert("Wooo");
            });
        });
    };
    Game.prototype.drawInitialCards = function () {
        for (var i = 0; i < 4; i++) {
            this.humanPlayer.drawCard();
            this.computerPlayer.drawCard();
        }
    };
    Game.prototype.fillDeck = function () {
        var colors = ['red', 'green', 'blue', 'yellow'];
        for (var i = 0; i < 4; i++) {
            for (var j = 1; j < 9; j++) {
                this.deck.push({ digit: j, color: colors[i] });
            }
        }
    };
    Game.prototype.shuffleDeck = function () {
        this.deck.sort(function () { return Math.random() - 0.5; });
    };
    Game.prototype.insertToGround = function (card) {
        this.ground.push(card);
    };
    Game.prototype.getCurrCard = function () {
        return this.ground[this.ground.length - 1];
    };
    Game.prototype.addCardToGround = function (card) {
        this.ground.push(card);
    };
    Game.prototype.drawCardFromDeck = function () {
        if (this.deck.length === 0) {
            this.moveGroundToDeck();
        }
        var newCard = this.deck.pop();
        return newCard;
    };
    Game.prototype.moveGroundToDeck = function () {
        var currCard = this.ground.pop();
        while (this.ground.length > 0) {
            this.deck.push(this.ground.pop());
        }
        this.shuffleDeck();
        this.ground.push(currCard);
    };
    Game.prototype.announceWinner = function () {
        alert("Hooray!");
        this.state = "end";
    };
    return Game;
}());
var game = new Game();
