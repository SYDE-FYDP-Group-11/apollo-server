const express = require("express");
const app = express();
var port = process.env.PORT || 3000;

app.get("/test", (req, res, next) => {
	res.json({hello: "World!"});
});

app.use(function(req, res) {
	res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
