var fs = require("fs");
var keypress = require('keypress');
var say = require("say");
var prompt = require('prompt')

var paused = true;
var voice = ""
var speed = 1.0;

var Book = {
	title: "",
	curLine: 0,
	lines: []
}

var schema = {
	properties: {
		file: {
			default: 'cu31924013200641.ptts',
			type: 'string',
			required: true
		},
		voice: {
			default: 'Microsoft Zira Desktop',
			type: 'string',
			required: true
		},
		line: {
			default: 0,
			type: 'number',
			required: true
		},
	}
};

var schemaGoto = {
	properties: {
		line: {
			default: 0,
			type: 'number',
			required: true
		}
	}
};

var schemaSpeed = {
	properties: {
		speed: {
			default: 1.0,
			type: 'number',
			required: true
		}
	}
};

function PlayBack() {
	keypress(process.stdin);
	process.stdin.on('keypress', function (ch, key) {
		if (key && key.name == 'space') {
			if (paused) {
				console.log("Unpaused, starting at line,", Book.curLine)
				paused = false;
				
				keypress(process.stdin);
				process.stdin.setRawMode(true);
				process.stdin.resume();
				
				PlayNextLine();
			} else {
				console.log("Paused, stopping at line,", Book.curLine)
				paused = true;
				say.stop()
				Book.curLine--;
				
				keypress(process.stdin);
				process.stdin.setRawMode(true);
				process.stdin.resume();
			}
		}
		
		if (key && key.name == 'g') {
			if (paused) {
				prompt.get(schemaGoto, function (err, result) {
					Book.curLine = result.line;
					console.log("Moving to line ",Book.curLine+1);
					
					keypress(process.stdin);
					process.stdin.setRawMode(true);
					process.stdin.resume();
				});
			} else {
				console.log("Must be paused to go to line.");
			}
		}
		
		if (key && key.name == 's') {
			if (paused) {
				prompt.get(schemaSpeed, function (err, result) {
					speed = result.speed;
					
					keypress(process.stdin);
					process.stdin.setRawMode(true);
					process.stdin.resume();
				});
			} else {
				console.log("Must be paused to go to line.");
			}
		}
		
		if (key && key.name == 'left') {
			if (paused) {
				Book.curLine--
			} else {
				pause = true;
				say.stop()
				Book.curLine--;
				
				Book.curLine--;
			}
			console.log("Line:", Book.curLine+1);
		}
		
		if (key && key.name == 'right') {
			if (paused) {
				Book.curLine++
			} else {
				pause = true;
				say.stop()
				Book.curLine--;
				
				Book.curLine++;
			}
			console.log("Line:", Book.curLine+1);
		}
		
		if (key && key.ctrl && key.name == 'c') {
			process.stdin.pause();
		}
	});

	process.stdin.setRawMode(true);
	process.stdin.resume();
}

function PlayNextLine() {

	if (paused) return;
	console.log("Playing line",Book.curLine,"\"" + Book.lines[Book.curLine] + "\"")
	say.speak(Book.lines[Book.curLine].toLocaleString().replace("\"","").replace("~","").replace("mm","Hem").replace("”","").replace("“",""), 'Microsoft Zira Desktop', speed, (err) => {
		keypress(process.stdin);
		process.stdin.setRawMode(true);
		process.stdin.resume();
		
		if (err) {
			paused = true;
			return console.log("Paused, stopping at line,", Book.curLine, err)
		}
		
		Book.curLine++;
		PlayNextLine();
	});
}

prompt.start();

prompt.get(schema, function (err, result) {
	console.log('Command-line input received:');
	console.log('  file: ' + result.file);
	console.log('  voice: ' + result.voice);
	console.log('  line: ' + result.line);
	
	voice = result.voice;
	
	Book = JSON.parse(fs.readFileSync(result.file, 'utf8'));
	Book.curLine = result.line;
	if (result.line<0)
		result.line=0;
	
	console.log("Press space to start book '", Book.title, "' at line", Book.curLine);
	PlayBack();
});