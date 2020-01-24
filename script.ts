export {};

interface Card {
    digit: number; // {1, 2, 3, 4, 5, 6, 7, 8}
    color: string; // {'red', 'green', 'blue', 'yellow'}
}

abstract class Player {
    private cards = [];

    scanCards(currentCard: Card) {
        let validCards = [];
        for (let i=0; i< this.cards.length; i++) {
            if (this.isValid(currentCard, this.cards[i])) {
                validCards.push(i);
            }
        }
        return validCards;
    }

    playCard(index: number) {
        let toPlayCard = this.cards[index];
        this.cards.splice(index, 1);
        return toPlayCard;
    }

    drawCard (newCard: Card) {
        this.cards.push(newCard);
    }

    didWin(): boolean {
        return this.cards.length === 0;
    }

    private isValid(firstCard: Card, secondCard: Card): boolean {
        return (firstCard.digit === secondCard.digit) || (firstCard.color === secondCard.color)
    }
}