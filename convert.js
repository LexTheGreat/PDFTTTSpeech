var textract = require('textract');
const path = require('path');
var prompt = require('prompt')

var Book = { title: "", curLine: 0, lines: [] };

var schema = {
	properties: {
		file: {
			default: "pdf-test.pdf",
			type: 'string',
			required: true
		},
	}
};

prompt.start();
prompt.get(schema, function (err, result) {
	result.file = path.normalize(result.file.replace("\"", ""));
	Book.title == path.basename(result.file);
	
	console.log("Parsing file. Please Wait.");
	textract.fromFileWithPath(result.file, function( error, text ) {
		console.log(error, text);
		console.log("Converting text into .ptts");
		Book.lines = text.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
		console.log("Saving .ptts")
		fs.writeFileSync(result.file.replace(".pdf", ".ptts"), JSON.stringify(Book));
		console.log("Finished.");
	})
});