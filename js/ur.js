$(function() {
    
    function startGame() {
        clearBoard();
        
        P = 'white';    //current player
        prepareRoll();

        INFO['turn'].html(P.toUpperCase() + ' PLAYS');
        INFO['roll'].html('ROLL!');
        INFO['reset'].html('RESET');
        INFO['reset'].addClass('small');

        P1 = new Player('white');
        P2 = new Player('black');
        PLAYERS = {'white': P1, 'black': P2};

        //events
        P1.listen();
        P2.listen();
        
        $dice_space.on('click', function() {
            if (!ROLL_LOCK) {
                if ($(this).hasClass('roll')) {
                    $(this).removeClass('roll selection');
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
        
        hoverSelect(INFO['reset'], 'selection');
        INFO['reset'].on('click', function() { startGame(); });
    
        rulesListener();

    };

    Player = function(color) {
        var me = this;
        this.color = color;
        this.opponent = null;
        this.color == 'white' ? this.opponent = 'black' : this.opponent = 'white';
        this.tokenclass = 'token-' + this.color;

        this.score = 0;
        this.$start_container = $('div#game-container div#' + color + '-start');
        this.$end_container = $('div#game-container div#' + color + '-end');
        
        this.path = [];
        getPath(this.color, this.path);
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

    //functions
    function roll() {
        return Math.floor(Math.random() * 2);
    };

    function addPath(tmp_path, path) {
        $.each(tmp_path, function (i, field) {
            path.push(field);
        });
    };

    function getPath(color, path) {
        var tmp_path = $('#path-' + color + '-start').children('div.path-field').toArray();
        addPath(tmp_path.reverse(), path);
        tmp_path = $path_main.children('div.path-field').toArray();
        addPath(tmp_path, path);
        tmp_path = $('#path-' + color + '-end').children('div.path-field').toArray();
        addPath(tmp_path.reverse(), path);
    };
    
    function endTurn() {
        prepareRoll();
        P == 'white' ? P = 'black' : P = 'white';
        INFO['turn'].html(P.toUpperCase() + ' PLAYS');
    };

    function prepareRoll() {
        ROLL = 0;
        ROLL_LOCK = false;
        $dice_space.addClass('roll selection');
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
        INFO['turn'].html(winner.color.toUpperCase() + ' WINS');
        INFO['roll'].html('');
        INFO['reset'].removeClass('small');
        ROLL_LOCK = true;
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

    function clearBoard() {
        $('.token-white, .token-black').removeClass('token-white token-black');
        $('div#black-start .container-field').addClass('token-black');
        $('div#white-start .container-field').addClass('token-white');
    };
    
    function hoverSelect($selector, hoverclass) {
        $selector.on('mouseover', function() {
            $(this).addClass(hoverclass);
        });
        $selector.on('mouseout', function() {
            $(this).removeClass(hoverclass);
        });
    };

    function hoverAnother($selector, $another, hoverclass) {
        $selector.on('mouseover', function() {
            $another.toggleClass(hoverclass);
        });
        $selector.on('mouseout', function() {
            $another.toggleClass(hoverclass);
        });
    };

    function rulesListener() {
        for (r in RULES) {
            hoverSelect(RULES[r][0], 'selection');
            if (r == 'pathblack' || r == 'pathwhite') {
                var path = showPath(RULES[r][1])
                hoverAnother(RULES[r][0], path, 'selection');
                hoverPathSigns(RULES[r][0], path);
            }
            else if (r == 'rolling') {
                hoverAnother(RULES[r][0], RULES[r][1], 'roll');
            } else {
                hoverAnother(RULES[r][0], RULES[r][1], 'selection');
            };
        };
    };

    function showPath(color, hoverclass) {
        var path = [];
        getPath(color, path);
        return $(path);
    };

    function hoverPathSigns($selector, path) {
        $.each($(path).filter('[data-arrow]'), function() {
            var arrow = $(this).attr('data-arrow');
            if (arrow == 'both') {
                ($selector.attr('id') == 'tut-pathwhite') ? arrow = 'down' : arrow = 'up';
            };
            hoverAnother($selector, $(this), 'arrow ' + arrow);
        });
    };

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
        reset: $($messages.find('#resetinfo')),
    };
    $tutinfo = $('div#info.rules');
    RULES = {
        rolling: [  $tutinfo.find('span#tut-rolling'), $dice_space],
        tokens: [$tutinfo.find('span#tut-tokens'), $('.token-black, .token-white')],
        startpos: [$tutinfo.find('span#tut-startpos'), $('#black-start, #white-start')],
        endpos: [$tutinfo.find('span#tut-endpos'), $('#black-end, #white-end')],
        rosettas: [$tutinfo.find('span#tut-rosettas'), $('.rosetta')],
        pathwhite: [$tutinfo.find('span#tut-pathwhite'), 'white'], 
        pathblack: [$tutinfo.find('span#tut-pathblack'), 'black'],
    };
    
    //game
    startGame();

});
