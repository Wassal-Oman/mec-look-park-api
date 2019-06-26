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
app.get("/load-parks", (req, res) => {
    // empty array
    const parkings = [];

    db.collection("parks").get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            parkings.push(doc.data());
        });

        res.json({
            status: "success",
            message: "Parks data",
            data: parkings
        });
    }).catch(err => {
        res.json({
            status: "error",
            message: "Cannot load parks data",
            data: err
        });
    });
});

// find car
app.post("/find-car", (req, res) => {
    // get request body
    const { car_number, car_code } = req.body;
    const bookings = [];

    db.collection("bookings").where("car_number", "==", Number.parseInt(car_number)).where("car_code", "==", car_code).get().then(snapshot => {
        if(snapshot.docs.length > 0) {
            snapshot.docs.forEach(doc => {
                bookings.push(doc.data());
            });

            res.json({
                status: "success",
                message: "Booking data",
                data: bookings[0]
            });
        } else {
            res.json({
                status: "failure",
                message: "No Booking data found",
                data: bookings
            });
        }
    }).catch(err => {
        res.json({
            status: "error",
            message: "Cannot get bookings data",
            data: err
        });
    });
});

// add car
app.post("/add-parking", (req, res) => {
    // get request body
    const { number, name, location, latitude, longitude, is_available } = req.body;

    // prepare data
    const parking = {
        parking_id: number,
        name,
        location,
        latitude,
        longitude,
        is_available
    }

    db.collection("parks").doc(`${parking.parking_id}`).set(parking).then(val => {
        res.json({
            status: "success",
            message: "Parking added successfully",
            data: val
        });
    }).catch(err => {
        res.json({
            status: "error",
            message: "Cannot add parking",
            data: err
        });
    });
});

// delete parking
app.post("/delete-parking", (req, res) => {
    // get request body
    const parking_id = req.body.parking_id;

    db.collection("parks").doc(`${parking_id}`).delete().then(() => {
        res.json({
            status: "success",
            message: "Parking deleted successfully"
        });
    }).catch(err => {
        res.json({
            status: "error",
            message: "Cannot delete parking",
            data: err
        });
    });
});

// serve app
app.listen(port, () => console.log(`Listening on port ${port}`));