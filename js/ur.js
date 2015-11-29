$(function() {
    
    //vars
    var P = 'white';    //current player
    var ROLL = 0;       //current roll
    var ROLL_LOCK = false;

    //$ objects
    $map = $('#game-container');
    $board = $('#board');
    $dice_space = $('#dice-space');
    $dies = $($dice_space).children('.die');
    $path_main = $('#path-main');
    $messages = $('#messages');
    INFO = {
        turn: $($messages.find('#turninfo')),
        roll: $($messages.find('#rollinfo')),
    };
    
    INFO['turn'].html(P.toUpperCase() + ' PLAYS');  ///////start positions in separate function
    INFO['roll'].html('ROLL!');
    
    var Player = function(color) {
        var me = this;
        this.color = color;
        this.opponent = null;
        this.color == 'white' ? this.opponent = 'black' : this.opponent = 'white';
        this.tokenclass = 'token-' + this.color;

        this.score = 0;
        this.$start_container = $('div#game-container div#' + color + '-start');
        this.$end_container = $('div#game-container div#' + color + '-end');
        
        this.path = [];
        var tmp_path = $('#path-' + color + '-start').children('div.path-field').toArray();
        addPath(tmp_path.reverse(), me);
        tmp_path = $path_main.children('div.path-field').toArray();
        addPath(tmp_path, me);
        tmp_path = $('#path-' + color + '-end').children('div.path-field').toArray();
        addPath(tmp_path.reverse(), me);
    };
    
    Player.prototype.listen = function() {
        var me = this;
        var canmove = false;
        var opponentclass = 'token-' + this.opponent;

        $map.on('mouseover', '.' + me.tokenclass + ':not(.end)', function() {
            if (PLAYERS[P] == me && ROLL > 0) { //check if the player can move
                canmove = canMoveFrom(me, this);
                if (canmove) {
                    $(this).toggleClass('selection');
                    $(canmove).addClass('selection');
                };
            };
        });

        $map.on('mouseout', '.' + me.tokenclass + ':not(.end)', function() {
            if (PLAYERS[P] == me && ROLL > 0) { //check if the player can move
                $(this).removeClass('selection');
                $(canmove).removeClass('selection');
            };
        });

        $map.on('click', '.' + me.tokenclass + ':not(.end)', function() {
            if (PLAYERS[P] == me && ROLL > 0) { //check if the player can move
                if (canmove) {
                    $(this).removeClass('selection');
                    $(canmove).removeClass('selection');
                    $(canmove).addClass(me.tokenclass);
                    $(this).removeClass(me.tokenclass);
                    
                    if ($(canmove).hasClass(opponentclass)) {
                        eat(canmove, me.opponent);
                    };
                    $(canmove).hasClass('rosetta') ? prepareRoll() : endTurn();
                    if ($(canmove).hasClass('end')) {
                        me.score += 1;
                        if (me.score == 6) {
                            endGame(me);
                        };
                    };
                };
            };
        });
    };

    var P1 = new Player('white');
    var P2 = new Player('black');
    var PLAYERS = {'white': P1, 'black': P2};

    //events
    P1.listen();
    P2.listen();
    
    $dice_space.on('click', function() {
        if (!ROLL_LOCK) {
            if ($(this).hasClass('roll')) {
                $(this).removeClass('roll');
                ROLL = 0;
                for (var i=0; i < $dies.length; i++) {
                    var die = roll();
                    ROLL += die;
                    $($dies[i]).addClass('die-' + die);
                };
            };

            ROLL_LOCK = true;

            if (ROLL == 0 || !canMove()) {
                $(this).delay(2000).queue(function(){
                    endTurn();
                    $(this).dequeue();
                });
            };
        
            INFO['roll'].html('ROLL: ' + ROLL);
        };
    });
    
    //functions
    function roll() {
        return Math.floor(Math.random() * 2);
    };

    function addPath(tmp_path, me) {
        $.each(tmp_path, function (i, field) {
            me.path.push(field);
        });
    };

    function endTurn() {
        prepareRoll();
        P == 'white' ? P = 'black' : P = 'white';
        INFO['turn'].html(P.toUpperCase() + ' PLAYS');
    };

    function prepareRoll() {
        ROLL = 0;
        ROLL_LOCK = false;
        $dice_space.addClass('roll');
        for (var i=0; i < $dies.length; i++) {
            $($dies[i]).removeClass('die-0 die-1');
        };
        INFO['roll'].html('ROLL!');
    };

    function eat(field, color) {
        moveToContainer(color, field, PLAYERS[color].$start_container);
    };

    function moveToContainer(color, field, $container) {
        var thisclass = 'token-' + color;
        $(field).removeClass(thisclass);
        var empty = $container.find(
            '.container-field:not(.' + thisclass +  '):first');
        $(empty).addClass(thisclass);
    };

    function endGame(winner) {
        INFO['turn'].html(winner.toUpperCase() + ' WINS');
        INFO['roll'].html('');
        //  options to reset

    };

    function startGame() {
        //reset variables
        //reset fields
        //reset players
        //start listening
    };

    function canMove() {
        var tokenclass = PLAYERS[P].tokenclass;
        var active_pieces = $('.' + tokenclass + ':not(.end)');
        
        for (var i=0; i < active_pieces.length; i++) {
            if (canMoveFrom(PLAYERS[P], active_pieces[i])) {
                return true;
            };
        };
        return false;
    };

    function canMoveFrom(player, current) {
        var path_index = player.path.indexOf(current);
        var new_index = path_index + ROLL;
        var tokenclass = player.tokenclass;
        var opponentclass = PLAYERS[player.opponent].tokenclass;

        canmove = false;
        if (new_index === player.path.length) {
            canmove = player.$end_container.find(
                '.container-field:not(.' + tokenclass +  '):first');
        } else {
            canmove = player.path[new_index];
            if (canmove === undefined) {
                canmove = false;
            };
        };

        if ($(canmove).hasClass(tokenclass)) {
            canmove = false;
        } else if ($(canmove).hasClass('rosetta') &&
                    $(canmove).hasClass(opponentclass)) {
            canmove = false;
        };
        return canmove;
    };

});
