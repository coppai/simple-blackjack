const Player = function(name, isDealer) {
    this.name = name;
    this.cards = [];
    this.handSum = 0;

    this.isDealer = isDealer ? true : false;
}

Player.prototype.calculateHandSum = function() {
    let sum = 0;
    let hasAce = false;

    for(index in this.cards){
        let card = this.cards[index],
            value = card.number;
            if(isNaN(parseInt(value))){
                if(value === 'ace'){
                    hasAce = true;
                    value = 0;
                } else {
                    value = 10;
                }
        }
        sum += parseInt(value);
    }

    if(hasAce){
        if((sum + 11) > 21){
            sum++;
        }else{
            sum = sum + 11;
        }
    }
    this.handSum = sum;
};

Player.prototype.addCards = function(cards){

    for(index in cards){
        let card = cards[index];
        this.cards.push(card);
    }
    this.calculateHandSum();
}


// object for handling our UI
const Table = function(){

    this.ui = {
        dealerRegion: $('#dealer-region'),
        player1Region: $('#player-1-region')
    }


    this.clearTable = function(){
        this.ui.dealerRegion.find('ul').empty();
        this.ui.player1Region.find('ul').empty();

    }

    this.showScore = function(region, score){
        region.find('.score').text(score);
    };

    this.showCards = function(region, cards){
        let $cardRegion = region.find('ul');
        $cardRegion.empty();
        for(let index in cards){
            let card = cards[index],
                file_name = `${card['number']}_of_${card['suite']}.png`; 
            $cardRegion.append(`<li class="card"><img src="./images/cards/${file_name}" /></li>`);
        }
    };

};


const Deck = function(){
    const _suits = ['clubs', 'diamonds', 'hearts', 'spades'];
    const _values = ['2', '3', '4', '5', '6', '7','8', '9', '10', 'jack', 'queen', 'king', 'ace'];
    this.cards = [];
    this.dealt = [];        // for debugging 

    this._dealCard = function() {
        let index = this.cards.length -1;
        var card = this.cards[index];
        this.cards.splice(-1,1);
        this.dealt.push(card);
        return card;
    }

    this.dealCards = function(numCards){
        let dealtCards = [];
        for(let x=0; x<numCards; x++){
            dealtCards.push(this._dealCard());
        }
        return dealtCards;
    }

    this._buildDeck = function() {
        for(const suite of _suits ){
            for(const numb of _values){
                this.cards.push({
                    'suite': suite,
                    'number': numb
                })
            }
        }
    }

    // shuffles our deck of cards
    this.shuffleDeck = function() {
        for(let x = 0; x<=15;x++){
            let shuffled = [];
            let cardsLeft = this.cards.length;

            do {
                let index = Math.floor(Math.random()*this.cards.length);
                shuffled.push(this.cards[index]);
                this.cards.splice(index,1);
                cardsLeft--;
            } while (cardsLeft > 0);
            this.cards = shuffled;
        }
    }
    this._buildDeck();
}


// this is our controller
const Blackjack = function() {

    this.ui = {
        hit: $('.hit'),
        hold: $('.hold'),
        newGame: $('.reset-game'),
        score: $('.score'),
        modal: $('#winner')
    }

    this.startGame = function() {
        this.dealer = new Player('Dealer', true);
        this.player1 = new Player('Player 1');
        this.table = new Table();
        this.deck = new Deck();

        this.deck.shuffleDeck();

        this.dealer.addCards(this.deck.dealCards(2));
        this.player1.addCards(this.deck.dealCards(2));

        this.table.showCards(this.table.ui.dealerRegion, this.dealer.cards);

        this.toggleDealerSecondCard();

        this.table.showCards(this.table.ui.player1Region, this.player1.cards);

        this.table.showScore(this.table.ui.player1Region, this.player1.handSum);


        if(this.player1.handSum === 21){
            this.ui.hit.addClass('disabled');
            this.ui.hold.addClass('disabled');
            this.declareWinner(this.player1);
            
        }

    }

    this.toggleDealerSecondCard = function(){
        $('#dealer-region ul li.card').last().toggle();
    }

    this.onHold = function() {
        
        this.ui.hit.addClass('disabled');
        this.ui.hold.addClass('disabled');
        this.toggleDealerSecondCard();
        if( this.dealer.handSum < 17 ){
            do {
                this.dealer.addCards(this.deck.dealCards(1));
                this.table.showCards(this.table.ui.dealerRegion, this.dealer.cards);
            } while (this.dealer.handSum <= 17);
        }

        this.determineWinner();


    }

    this.onHitPlayer = function() {
        this.ui.hold.removeClass('disabled');

        this.player1.addCards(this.deck.dealCards(1));
        this.table.showCards(this.table.ui.player1Region, this.player1.cards);
        this.table.showScore(this.table.ui.player1Region, this.player1.handSum);

        if(this.player1.handSum > 21){
            this.ui.hit.addClass('disabled');
            this.ui.hold.addClass('disabled');
            this.declareWinner(this.dealer);
        }
    }

    this.determineWinner = function(){

        if(this.dealer.handSum > 21){
            this.declareWinner(this.player1);
        }
        else if(this.player1.handSum === this.dealer.handSum){
            alert('draw');
        }
        else if(this.player1.handSum > this.dealer.handSum){
            this.declareWinner(this.player1);
        }
        else {
            this.declareWinner(this.dealer);
        }
    }


    this.declareWinner = function(winner) {
        if(winner.name === 'Dealer'){
            $('#winner .modal-header h4').html('You Lose')
            $('#winner .modal-body p').html('The dealer won.  Play again?')
        }else {        
            $('#winner .modal-header h4').html('You Win')
            $('#winner .modal-body p').html('Nice game.  Play again?')
        }
        this.ui.modal.modal();
    }


    // starts a game
    this.startNewGame = function() {
        delete this.dealer;
        delete this.player1;
        delete this.dealer;
        delete this.deck;
        this.ui.hold.removeClass('disabled');
        this.ui.hit.removeClass('disabled');
        this.startGame();
    }


    this._init = function() {
        this.ui.hit.click(this.onHitPlayer.bind(this));
        this.ui.newGame.click(this.startNewGame.bind(this));
        this.ui.hold.click(this.onHold.bind(this));

        //this.startNewGame.bind(this)

        $('.modal-play-again').click(function(){
            this.startNewGame();
            this.ui.modal.modal('hide');

        }.bind(this));
    }

    this._init();

};



// IIF so that we don't pollute the global 
(function(){

    const game = new Blackjack();

    game.startGame();

})();