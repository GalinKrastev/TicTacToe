// shim for forEach 
(function () {
    if (!Array.prototype.forEach){
        Array.prototype.forEach = function(fun /*, thisp*/){
            var len = this.length;
            if (typeof fun != "function") throw new TypeError();

            var thisp = arguments[1];
            for (var i = 0; i < len; i++){
                if (i in this) fun.call(thisp, this[i], i, this);
            }
        };
    }
})();

// used for testing while coding, remove once all done!
var Logger = (function logger () {
    var messages = new Array();

    var getTimestamp = function () {
        var currentdate = new Date(); 
        var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds() + " -> ";

        return datetime;
    }

    var isValidMessage = function (message) {
        if(message == undefined || message == "")
            throw new TypeError("Parameter message should have a value.");

        return true;
    }

    this.get = function (index) {
        return messages[index];
    }

    this.logAll = function () {
        messages.forEach( function (m) {
            console.log(m);
        });
    }

    this.addMessage = function (message) {
        if(isValidMessage(message))
            messages.push(getTimestamp() + message);
    }

    this.log = function (message) {
        if(isValidMessage(message)) {
            this.addMessage(message);
            console.log(getTimestamp() + message);
        }
    }

    this.clearConsole = function () {
        console.clear();
    }

    this.reset = function () {
        messages = new Array();
        this.clearConsole();
    }

    return this;
})();

function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

var Timer = function(duration, checkInterval, listener, iteratedFunctions) {
    var _endsIn = duration || 1000;
    var _checkInterval = checkInterval || 250;
    var _listener = listener;
    var _iteratedFunctions = iteratedFunctions;
    var _isStarted = false;
    var _countDown = duration;
    var _timerId = null;
    var self = this;

    this.start = function() {
        _isStarted = true;

        _timerId = window.setInterval(checkIfTimeEnded, _checkInterval);
    };

    this.isStarted = function () {
        return _isStarted;
    };

    this.stop = function() {
        _isStarted = false;

        if(_timerId) window.clearInterval(_timerId);
    };

    this.restart = function () {
        if(_isStarted) self.stop();
        
        _countDown = _endsIn;

        self.start();
    };

    this.endsIn = function () {
        return _countDown;
    };

    var callListener = function () {
        if(_listener) _listener.call(this);
    };
    

    var callIteratedFunctions = function () {
        if(_iteratedFunctions)
            for (var i = 0; i<_iteratedFunctions.length; i++)
                if(isFunction(_iteratedFunctions[i]))
                    _iteratedFunctions[i].call(this);
    };

    var checkIfTimeEnded = function () {
        callIteratedFunctions();

        if(_countDown > 0) {
            _countDown -= _checkInterval;
        } else {
            self.stop();
            callListener();
        }
    }
}; 

var PubSub = {};
(function( q ) {
    var topics = {},
    subUid = -1;

    // Publish or broadcast events of interest
    // with a specific topic name and arguments
    // such as the data to pass along
    q.publish = function( topic, args ) {
        if ( !topics[topic] ) return false;

        var subscribers = topics[topic],
        len = subscribers ? subscribers.length : 0;
        while ( len-- ) subscribers[len].func( args );

        return this;
    };

    // Subscribe to events of interest
    // with a specific topic name and a
    // callback function, to be executed
    // when the topic/event is observed
    q.subscribe = function( topic, func ) {
        if ( !topics[topic] ) topics[topic] = [];   

        var token = ( ++subUid ).toString();
        topics[topic].push({
            token: token,
            func: func
        });

        return token;
    };

    // Unsubscribe from a specific
    // topic, based on a tokenized reference
    // to the subscription
    q.unsubscribe = function( token ) {
        for ( var m in topics ) {
            if ( topics[m] ) {
                for ( var i = 0, j = topics[m].length; i < j; i++ ) {
                    if ( topics[m][i].token === token ) {
                        topics[m].splice(i, 1);
                        return token;
                    }
                }
            }
        }

        return this;
    };
}( PubSub ));

var Events = {
    PlayerIncreasePoints: "Player/IncreasePoints",
    PlayerMadeMove: "Player/MadeMove",
    PlayerResetPoints: "Player/ResetPoints",

    PlayerTimesUp: "Player/TimesUp",
    PlayerTimerStart: "Player/Timer/Start",
    PlayerTimerStop: "Player/Timer/Stop",
    PlayerTimerRestart: "Player/Timer/Restart",

    EngineStart: "Engine/Start",
    EngineStop: "Engine/Stop",
    
    GameJudgeRequestMove: "GameJudge/RequestMove",

    GameTimerStart: "Game/Timer/Start",
    GameTimerStop: "Game/Timer/Stop",
    GameTimerPause: "Game/Timer/Pause"
};

var HtmlElements = {
	"input":"input",
	"span":"span",
	"div": "div"
};

var HtmlAttributes = {
	"id":"id",
	"div": "div",
	"type":"type",
	"value":"value",
	"maxlength": "maxlength",
	"readonly": "readonly",
	"class": "class",
	"value": "value"
}

var AttrbuteValues = {
	"text":"text"
}

var Score = function (id) {
    this.id = id || "score";
    this.val = 0;
}

Score.prototype = {

    constructor: Score,

    increase: function () {
        this.val++;
        this.update();
    },

    reset: function () {
        this.val = 0;
        this.update();
    },

    toHtmlObj: function () {
        var element = document.createElement(HtmlElements.span);
        element.setAttribute(HtmlAttributes.id, this.id);
        element.textContent = this.val;

        return element;
    },

    update: function () {
        if(document.getElementById(this.id)){
            var element = document.getElementById(this.id);
            element.textContent = this.val;
        }
    }
};

var Figure = function (sign) {
    this._sign = undefined;
    if(typeof sign == "string"){
        this._sign = sign;
    } else {
        throw new Error(["Invalid Parameter", "sign"]);
    }
}

Figure.prototype = {

    constructor: Figure,

    toString: function () {
        return this._sign;
    }
};

var Player = function (id, name, score, firure) {
    this.name = null;
    this.score = null;
    this.figure = null;
    this.isOnMove = false;

    if(typeof name == "string")
        this.name = name;
    else 
        throw new Error(["Invalid Parameter", "name"]);

    if(score instanceof Score)
        this.score = score;
    else
        throw new Error(["Invalid Parameter", "score"]);

    if(firure instanceof Figure)
        this.figure = firure;
    else 
        throw new Error(["Invalid Parameter", "figure"]);

    this.id = id || name;
}

Player.prototype = {

    constructor: Player,

    score: function () {
        return this.score;
    },

    figure: function () {
        return this.figure;
    },

    render: function () {
        var pl = document.createElement(HtmlElements.span);
        pl.setAttribute(HtmlAttributes.id, this.id);
        pl.textContent = this.name + " : " + this.score.val;

        return pl;
    }
};

var Engine = function (players, grid) {
    this.players = players;
    this.grid = grid;
    this.gameJudge = new GameJudge(grid);
    this.subscriptions = new Array();
}

Engine.prototype = {

    constructor: Engine,

    getPlayerOnMove: function () {
        for (var i = 0; i < this.players.length; i++)
            if(this.players[i].isOnMove) return this.players[i];
    },

    viceVersaPlayersMoves: function () {
        for (var i = 0; i < this.players.length; i++) {
            var pl = this.players[i];
            pl.isOnMove = (pl.isOnMove)? false : true;
        }
    },

    start: function () {
        var self = this;

        self.subscriptions.push(
            (function () {
                return PubSub.subscribe( Events.PlayerMadeMove, function( cell ){
                    var playerOnMove = self.getPlayerOnMove();
                    cell.update( playerOnMove.figure.toString() );

                    if(self.gameJudge.doWeHaveWinner( playerOnMove ))
                        PubSub.publish( Events.PlayerIncreasePoints, playerOnMove );

                    self.viceVersaPlayersMoves();
                    PubSub.publish( Events.PlayerTimerRestart );
                });
            })()
        );

        self.subscriptions.push(
            (function () {
                return PubSub.subscribe( Events.PlayerIncreasePoints, function ( playerOnMove ) {
                    playerOnMove.score.increase();
                    window.setTimeout( function () { self.grid.reset(); }, 200 );
                });
            })()
        );

        self.subscriptions.push(
            (function () {
                return PubSub.subscribe( Events.PlayerTimesUp, function () {
                    self.viceVersaPlayersMoves();
                    PubSub.publish( Events.PlayerTimerRestart );
                });
            })()
        );

        this.grid.render();

        PubSub.publish(Events.GameTimerStart);
        PubSub.publish(Events.PlayerTimerStart);
    },

    stop: function () {
        this.subscriptions.forEach( function ( subscription ) {
            PubSub.unsubscribe( subscription );
        });

        PubSub.publish(Events.GameTimerStop);
        PubSub.publish(Events.PlayerTimerStop);
    }
};

var Cell = function (id, row, col) {
	this.id = null;
	this.row = null;
	this.col = null;
	this.isActive = false;

	if(typeof id == "string")
		this.id = id;
	else 
		throw new Error(["Invalid parameter", "id"]);

	if(typeof row == "number")
		this.row = row;
	else
		throw new Error(["Invalid parameter", "row"]);

	if(typeof row == "number")
		this.col = col;
	else
		throw new Error(["Invalid parameter", "col"]);

	this.value = null;
}

Cell.prototype = {

	constructor: Cell,

	toHtmlObj: function () {
		var el = document.createElement(HtmlElements.input);
		el.setAttribute(HtmlAttributes.id, this.id);
		el.setAttribute(HtmlAttributes.type, AttrbuteValues.text);
		el.setAttribute(HtmlAttributes.maxlength, 1);
		el.setAttribute(HtmlAttributes.readonly, true);

		var self = this;
		el.onclick = function () {
			self.isActive = true;
			if(!self.value) // if clicked once, the event hould be disabled, as this is invalid move
                PubSub.publish(Events.PlayerMadeMove, self);
		}

		return el;
	},

	update: function (value) {
		this.value = value;
		this.isActive = false;
		if(!document.getElementById(this.id).value){
			document.getElementById(this.id).setAttribute(HtmlAttributes.value, this.value);
		}
	},

    clear: function () {
        this.value = "";
        this.isActive = false;
        document.getElementById(this.id).setAttribute(HtmlAttributes.value, this.value);
    }
}


var Grid = function (id, rows, cols) {
	this.grid = new Array();
    this.rows = rows;
    this.cols = cols;

	//initialize the grid
	for (var row = 0; row < this.rows; row++)
		this.grid[row] = new Array(this.cols);

	//fill the grid with cells
	for (var row = 0; row < this.rows; row++) {
		for (var col = 0; col < this.cols; col++) {
			var cell  = new Cell("grid-cell-" + row.toString() + col.toString(), row, col);
			this.grid[row][col] = cell;
		}
	}
}

Grid.prototype = {

	constructor: Grid,

	toHtmlObj: function () {
		var div = document.createElement(HtmlElements.div);
		div.setAttribute(HtmlAttributes.id, "grid");

		for (var row = 0; row < this.rows; row++) {
			for (var col = 0; col < this.cols; col++) {
				var cell = this.grid[row][col].toHtmlObj();
				if((row+col) % 2 == 0)
					cell.setAttribute(HtmlAttributes.class, "gray");

				div.appendChild(cell);
			}
		}

		return div;
	},

    getCell: function (row, col) {
        return this.grid[row][col];
    },

	getActiveCell: function () {
		for (var row = 0; row < this.rows; row++)
			for (var col = 0; col < this.cols; col++)
				if((this.grid[row][col]).isActive) return cell;

		return false;
	},

    reset: function () {
        for (var row = 0; row < this.rows; row++)
            for (var col = 0; col < this.cols; col++)
                this.grid[row][col].clear();
    },

	render: function () {
		var htmlObj = this.toHtmlObj();
		document.body.appendChild(htmlObj);
	}
}

var GameJudge = function (grid) {
    this.grid = grid;

    this.winCombinations = {
        firstDiagonal: [
            [null, null, true],
            [null, true, null],
            [true, null, null]
        ],

        secondDiagonal: [
            [true, null, null],
            [null, true, null],
            [null, null, true]
        ],

        horizontalFirst: [
            [true, true, true],
            [null, null, null],
            [null, null, null]
        ],

        horizontalSecond: [
            [null, null, null],
            [true, true, true],
            [null, null, null]
        ],

        horizontalThird: [
            [null, null, null],
            [null, null, null],
            [true, true, true]
        ],

        verticalFirst: [
            [true, null, null],
            [true, null, null],
            [true, null, null]
        ],

        verticalSecond: [
            [null, true, null],
            [null, true, null],
            [null, true, null]
        ],

        verticalThird: [
            [null, null, true],
            [null, null, true],
            [null, null, true]
        ]
    }
}

GameJudge.prototype = { 

    constructor: GameJudge,

    compareMatrixes: function (sourceMatrix, compareMatrix, playerOnMove) {
        var result = true;
        for (var row = 0; row < compareMatrix.rows; row++) {
            for (var col = 0; col < compareMatrix.cols; col++) {
                if (sourceMatrix[row] != null && sourceMatrix[row][col] != null) {
                    if(playerOnMove.figure.toString() == compareMatrix.getCell(row,col).value) {
                        result = true;
                    } else {
                        result = false;
                        break
                    }
                }
            }

            if(!result) break;
        }

        return result;
    },

    doWeHaveWinner: function (playerOnMove) {
        var result = false;

        for (prop in this.winCombinations) {
            var sourceMatrix = this.winCombinations[prop];

            if(this.compareMatrixes(sourceMatrix, this.grid, playerOnMove)){
                result =  true;
                break
            }
        }

        return result;
    }
}