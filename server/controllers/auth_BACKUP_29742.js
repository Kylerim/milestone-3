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

<<<<<<< HEAD
			//send email
			const output = `
				<p>Please VERIFY Account</p>
				<ul>  
				<li>Email: ${email}</li>
				<li>Key: ${randomKey}</li>
				</ul>
				<h3>Message</h3>
				<a href="
				http://kylerim.cse356.compas.cs.stonybrook.edu/users/verify?email=${email}&key=${randomKey}">
				VERIFY ACCOUNT</a>
			`;

			let transporter = nodemailer.createTransport({
				service: 'postfix',
				host: 'kylerim.cse356.compas.cs.stonybrook.edu',
				secure: false,
				port: 587,
				auth: { user: 'root@kylerim.cse356.compas.cs.stonybrook.edu', pass: 'kylerim' },
				tls: { rejectUnauthorized: false }
			});

			let mailOptions = {
				from: 'root@kylerim.cse356.compas.cs.stonybrook.edu',
				to: email,
				subject: 'test',
				text: 'hope it got there',
				html: output // html body

			};

			//  send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				res.json({ status: "error", message: "Error sending email" })
				return console.log(error);
			}

			console.log('Message sent: %s', info.messageId);
			console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
			newUser.save((err, success) => {
			if (err) {
				res.json({ status: "error", message: "error with sign up " + err })
			} else {
				console.log("Saved Sucessfully")
			}
			})
			res.json({ status: "OK", message: "Signup Successful! Please Verify Account in your email" })


			});
=======
            newUser.save((err, success) => {
                if (err) {
                    res.json({ status: "error", message: "error with sign up " + err })
                } else {
                    res.json({ status: "OK", message: "Added a user successfully" })
                    console.log("Saved Sucessfully")
                }
            })
>>>>>>> 742731ee052379360963070e057ec415389fd581

        }
    })
}

exports.login = (req, res) => {
    res.setHeader('X-CSE356', GROUP_ID);
    console.log("Login Requested Body: ", req.body);

    if (req.session.user) {
        console.log(req.session.user, " has logged in with session.")

<<<<<<< HEAD
exports.loginWithSession = (req, res) => {
    res.setHeader('X-CSE356', GROUP_ID);
    // ADD LOGIN
    if (req.session === undefined) {
        res.json({ status: "error", message: "No session" })
        return;
    } else {
=======
>>>>>>> 742731ee052379360963070e057ec415389fd581
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
