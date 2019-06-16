// load libraries
const path = require("path");
const express = require("express");
const firebase = require("firebase");
const admin = require("firebase-admin");

// initialize app and set port
const app = express();
const port = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const config = {
    apiKey: "AIzaSyCBknviPXV_ApLxjCY8YkeogVK3Misn3Ak",
    authDomain: "mec-parking.firebaseapp.com",
    databaseURL: "https://mec-parking.firebaseio.com",
    projectId: "mec-parking",
    storageBucket: "mec-parking.appspot.com",
    messagingSenderId: "844300942770",
    appId: "1:844300942770:web:8d7237a78588c122"
};

// initialize firebase
firebase.initializeApp(config);

// firebase admin configuration
const adminConfig = require(path.join(__dirname, "ServiceAccountKey"));

// initialize firebase admin
admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: "https://mec-parking.firebaseio.com"
});

// firebase database
const db = admin.firestore();

// login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    firebase.auth().signInWithEmailAndPassword(email, password).then(data => {
        res.json({
            status: "success",
            message: "Login Successful",
            data: data.user
        });
    }).catch(err => {
        res.json({
            status: "error",
            message: "Wrong email or password",
            data: err
        });
    });
});

// load parkings
app.get("/load-parkings", (req, res) => {
    // empty array
    const parkings = [];

    db.collection("parkings").get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            parkings.push(doc.data());
        });

        res.json({
            status: "success",
            message: "Parkings data",
            data: parkings
        });
    }).catch(err => {
        res.json({
            status: "error",
            message: "Cannot load parkings data",
            data: err
        });
    });
});

// serve app
app.listen(port, () => console.log(`Listening on port ${port}`));