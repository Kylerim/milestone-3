const { application } = require('express');
const nodemailer = require('nodemailer');
const { GROUP_ID } = require('../common');
const { User } = require('../models/User');

exports.adduser = (req, res) => {
    res.setHeader('X-CSE356', GROUP_ID)
    console.log(req.body);
    const { username, email, password } = req.body

    User.findOne({ username }).exec((err, user) => {
        if (user) {
            res.json({ status: "error", message: "username already exists" })
        } else {
            let randomKey = Math.random().toString(36).substring(2, 9);
            console.log({ username, email, password, key: randomKey });
            let newUser = new User({ username, email, password, key: randomKey });

            newUser.save((err, success) => {
                if (err) {
                    res.json({ status: "error", message: "error with sign up " + err })
                } else {
                    res.json({ status: "OK", message: "Added a user successfully" })
                    console.log("Saved Sucessfully")
                }
            })

        }
    })
}

exports.login = (req, res) => {
    res.setHeader('X-CSE356', GROUP_ID);
    console.log("Login Requested Body: ", req.body);

    if (req.session.user) {
        console.log(req.session.user, " has logged in with session.")

        User.findOne({ username: req.session.user }).exec((err, user) => {
            if (err) {
                res.json({ status: "error", message: "Error in fetching data from db" })
            }
            else if (!user) {
                req.session.destroy();
                res.json({ status: "error", message: "No user with corresponding username" })
            }
            else {
                res.json({ status: "OK", message: "Login with session" })
            }
        })

    } else {

        const { username, password } = req.body
        if (username && password) {
            //LOGIN
            User.findOne({ username }).exec((err, user) => {
                if (err) {
                    return res.json({ status: "error", message: "Error in fetching data from db" })
                }
                if (!user) {
                    return res.json({ status: "error", message: "No user with corresponding username and password" })
                }
                const dbPassword = user.password
                if (password != dbPassword) {
                    return res.json({ status: "error", message: "Incorrect password" })
                } else if (!user.isVerified) {
                    return res.json({ status: "error", message: "User is not verified yet" })
                } else {
                    req.session.user = username
                    req.session.save(() => {
                        console.log("Saved a new session for: ", req.session.user);
                        return res.json({
                            status: "OK", name: req.session.user
                        });
                    });
                }
            })
        } else {
            res.json({ status: "error", message: "no username/pw provided | no session found yet" })
            return;

        }

    }
}


exports.verify = (req, res) => {
    res.setHeader('X-CSE356', GROUP_ID)
    console.log(req.body);
    const email = req.query.email;
    const key = req.query.key;

    User.findOne({ email }).exec((err, user) => {
        console.log(user);
        if (user) {
            if (user.key == key) {
                User.findOneAndUpdate({ email: email }, { isVerified: true }, (err, user) => {
                    if (!user) {
                        res.json({ status: "error", message: "SignUp ERROR" });
                        console.log("Error with verifying when user is true: ", err);
                    } else {
                        res.json({ status: "OK", message: "SignUp successfully! Your account is activated." })
                    }
                })
            } else {
                res.json({ status: "error", message: "Invalid Key " });
            }
        }
        else {
            res.json({ status: "error", message: "No such email account" });
        }
    })

}

exports.logout = (req, res) => {
    res.setHeader('X-CSE356', GROUP_ID);
    req.session.destroy(() => {
        return res.json({ status: "OK", "message": "logged out" });
    })



}
