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
        this.game.insertToGround(toPlayCard);
        if (this.didWin())
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
    Player.prototype.getCardsInHand = function () {
        return this.cards;
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
            this.highlightPossibleCards(possibleCards);
    };
    HumanPlayer.prototype.playCard = function (index) {
        this.dimPossibleCards();
        _super.prototype.playCard.call(this, index);
    };
    HumanPlayer.prototype.drawCard = function () {
        this.dimDeck();
        _super.prototype.drawCard.call(this);
    };
    HumanPlayer.prototype.highlightPossibleCards = function (possibleCards) {
        this.game.setGameState("play");
        var cardList = document.querySelector(".humanArea .cards").children;
        possibleCards.forEach(function (card) {
            cardList[card].classList.add("raise");
        });
    };
    HumanPlayer.prototype.highlightDeck = function () {
        this.game.setGameState("draw");
        var deck = document.querySelector(".deck .cardBack");
        deck.classList.add("glow");
    };
    HumanPlayer.prototype.dimPossibleCards = function () {
        var cardList = document.querySelector(".humanArea .cards").children;
        for (var i = 0; i < cardList.length; i++) {
            cardList[i].classList.remove("raise");
        }
    };
    HumanPlayer.prototype.dimDeck = function () {
        var deck = document.querySelector(".deck .cardBack");
        deck.classList.remove("glow");
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
            this.playCard(possibleCards[0]);
    };
    return ComputerPlayer;
}(Player));
var Game = /** @class */ (function () {
    function Game() {
        this.humanPlayer = new HumanPlayer(this);
        this.computerPlayer = new ComputerPlayer(this);
        this.deck = [];
        this.ground = [];
        this.state = "start";
        this.fillDeck();
        this.shuffleDeck();
        this.insertToGround(this.deck.pop());
        this.setupCurtainListener();
        this.setupDeckListener();
    }
    Game.prototype.startGame = function () {
        this.drawInitialCards();
        this.renderCards();
        this.humanPlayer.playTurn();
    };
    Game.prototype.getGameState = function () {
        return this.state;
    };
    Game.prototype.setGameState = function (state) {
        this.state = state;
    };
    Game.prototype.setupCurtainListener = function () {
        document.querySelector("#curtain button").addEventListener('click', function () {
            document.getElementById("curtain").style.display = "none";
            game.startGame();
        });
    };
    Game.prototype.setupDeckListener = function () {
        document.querySelector(".deck .cardBack").addEventListener('click', function () {
            if (game.getGameState() === "draw") {
                game.humanPlayer.drawCard();
                game.completeTurn();
            }
        });
    };
    Game.prototype.setupHumanCardListener = function () {
        document.querySelectorAll(".humanArea .cardFront").forEach(function (card) {
            card.addEventListener('click', function (event) {
                if (game.getGameState() === "play") {
                    var selectedCard = event.target;
                    if (selectedCard.parentElement.classList.contains("raise")) {
                        var index = parseInt(selectedCard.getAttribute("index"));
                        game.humanPlayer.playCard(index);
                        game.completeTurn();
                    }
                }
            });
        });
    };
    Game.prototype.completeTurn = function () {
        this.renderCards();
        this.setGameState("computer");
        setTimeout(function () {
            game.computerPlayer.playTurn();
            game.renderCards();
            game.humanPlayer.playTurn();
        }, 1000);
    };
    Game.prototype.drawInitialCards = function () {
        for (var i = 0; i < 4; i++) {
            this.humanPlayer.drawCard();
            this.computerPlayer.drawCard();
        }
    };
    Game.prototype.renderCards = function () {
        var computerCardsCount = this.computerPlayer.getCardsInHand().length;
        var humanCards = this.humanPlayer.getCardsInHand();
        var groundCard = this.ground[this.ground.length - 1];
        this.updateGroundCard(groundCard);
        this.updateComputerCards(computerCardsCount);
        this.updateHumanCards(humanCards);
        this.setupHumanCardListener();
    };
    Game.prototype.updateGroundCard = function (groundCard) {
        var groundCardElement = document.querySelector(".ground .cardFront");
        groundCardElement.innerHTML = groundCard.digit.toString();
        groundCardElement.style.backgroundColor = groundCard.color;
    };
    Game.prototype.updateComputerCards = function (computerCardsCount) {
        var computerCardList = document.querySelector(".computerArea .cards");
        computerCardList.innerHTML = '';
        for (var i = 0; i < computerCardsCount; i++) {
            var backCard = "<li><div class=\"cardBack\"></div></li>";
            computerCardList.innerHTML += backCard;
        }
    };
    Game.prototype.updateHumanCards = function (humanCards) {
        var computerCardList = document.querySelector(".humanArea .cards");
        computerCardList.innerHTML = '';
        for (var i = 0; i < humanCards.length; i++) {
            var digit = humanCards[i].digit;
            var color = humanCards[i].color;
            var frontCard = "<li><div class=\"cardFront\" index=\"" + i + "\" style=\"background-color:" + color + ";\">\n            <span class=\"digit\">" + digit + "</span>\n            </div></li>";
            computerCardList.innerHTML += frontCard;
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
    Game.prototype.drawCardFromDeck = function () {
        if (this.deck.length === 0) {
            this.moveGroundToDeck();
        }
        var newCard = this.deck.pop();
        return newCard;
    };
    Game.prototype.moveGroundToDeck = function () {
        if (this.ground.length < 2)
            alert("No more cards!");
        var currCard = this.ground.pop();
        while (this.ground.length > 0) {
            this.deck.push(this.ground.pop());
        }
        this.shuffleDeck();
        this.ground.push(currCard);
    };
    Game.prototype.announceWinner = function () {
        setTimeout(function () { alert("Hooray!"); }, 1000);
        this.setGameState("end");
    };
    return Game;
}());
var game = new Game();
