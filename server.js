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

const upload = multer({
	storage: storage,
	// fileFilter: (req, file, cb) => {
	// 	if (
	// 		file.mimetype == "image/png" ||
	// 		file.mimetype == "image/jpg" ||
	// 		file.mimetype == "image/jpeg"
	// 	) {
	// 		cb(null, true);
	// 	} else {
	// 		cb(null, false);
	// 		return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
	// 	}
	// },
});

// connect to mongodb database
const MongoClient = require("mongodb").MongoClient;
const url =
	"mongodb+srv://ait:ait@cluster0.4bsqv.mongodb.net/MulterUpload?retryWrites=true&w=majority";

MongoClient.connect(
	url,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	(err, db) => {
		if (err) throw err;
		database = db.db("MulterUpload");
		uploads = database.collection("uploads");
	}
);

app.get("/single", function (req, res) {
	res.sendFile(__dirname + "/singleupload.html");
});

app.get("/multiple", function (req, res) {
	res.sendFile(__dirname + "/multipleupload.html");
});

app.post("/uploadsinglefile", upload.single("fileUpload"), (req, res) => {
	const file = req.file;
	const fileName = file.originalname;
	const fileType = file.mimetype;
	const fileSize = file.size;
	const filePath = file.path;
	const fileObject = { fileName, fileType, fileSize, filePath };
	uploads.insertOne(fileObject, function (err, res) {
		if (err) throw err;
		console.log("Image path for " + fileName + " added to MongoDB");
	});
	res.sendFile(__dirname + "/success.html");
});

app.post("/uploadmultiplefile", upload.array("fileUpload", 5), (req, res) => {
	const files = req.files;
	for (var i = 0; i < files.length; i++) {
		const fileName = files[i].originalname;
		const fileType = files[i].mimetype;
		const fileSize = files[i].size;
		const filePath = files[i].path;
		const file = { fileName, fileType, fileSize, filePath };
		uploads.insertOne(file, function (err, res) {
			if (err) throw err;
			console.log("File path for " + fileName + " added to MongoDB");
		});
	}

	res.sendFile(__dirname + "/success.html");
});

app.listen(port, () =>
	console.log(`Multer Demo App started listening on port ${port}!`)
);
