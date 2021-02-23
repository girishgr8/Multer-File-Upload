const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const mongo = require("mongodb");

const port = 3000 || process.env.PORT;

let database, uploads;

// Serve static files (like css and js from public directory)
app.use(express.static(__dirname + "/public/"));

// Setting the storage engine...
const storage = multer.diskStorage({
	destination: "./uploads",
	filename: (req, file, callbackFn) => {
		console.log(file);
		callbackFn(null, file.originalname);
	},
});

const upload = multer({ storage: storage }).single("fileUpload");

// connect to mongodb database
const MongoClient = require("mongodb").MongoClient;
const url =
	"mongodb+srv://ait:ait@cluster0.4bsqv.mongodb.net/ShreejiEstates?retryWrites=true&w=majority";

MongoClient.connect(
	url,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	(err, db) => {
		if (err) throw err;
		database = db.db("ShreejiEstates");
		uploads = database.collection("uploads");
	}
);

app.get("/", function (req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.post("/uploadfile", (req, res) => {
	upload(req, res, (err) => {
		if (err) {
		} else {
			const fileName = req.file.originalname;
			const fileType = req.file.mimetype;
			const fileSize = req.file.size;
			const filePath = req.file.path;
			const file = { fileName, fileType, fileSize, filePath };
			uploads.insertOne(file, function (err, res) {
				if (err) throw err;
				console.log("Image path for " + fileName + " added to MongoDB");
			});
			res.sendFile(__dirname + "/success.html");
		}
	});
});

app.listen(port, () =>
	console.log(`Multer Demo App started listening on port ${port}!`)
);
