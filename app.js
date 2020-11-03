const express = require("express");
const app = express();
var port = process.env.PORT || 3000;

app.get("/1", (req, res, next) => {
	res.json({
		topicCoverage: 1,
		publisherQuality: 1,
		publisherBias: "Right",
		satire: true,
		evidenceCited: true,
		authorVerified: true,
		imageManipulated: true,
		urlSuspicious: true,
		headlineSuspicious: true
	});
});

app.get("/2", (req, res, next) => {
	res.json({
		topicCoverage: 5,
		publisherQuality: 5,
		publisherBias: "Left",
		satire: false,
		evidenceCited: false,
		authorVerified: false,
		imageManipulated: false,
		urlSuspicious: false,
		headlineSuspicious: false
	});
});

app.get("/echo", (req, res, next) => {
	res.json({headers: req.headers, body: req.body});
});

app.use(function(req, res) {
	res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
