const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const session=require('express-session');
const isAuthenticated = require("./middleware");

const mongoose = require('mongoose');
const Login = require('./schema');
const bcrypt = require('bcrypt');

app.use(session({
    secret: "Helllo2131@", 
    resave: false, 
    saveUninitialized: false,
    cookie: { secure: false,
        maxAge: 30 * 60 * 1000 
     } 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

mongoose.connect('mongodb://127.0.0.1:27017/login');



app.get('/', (req, res) => {
    if (req.session.user) {
        return res.render('dashboard'); 
    }
    res.render('Home'); 
});



app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Login({ username: username, password: hashedPassword });
    await newUser.save();  
    if(newUser){
        res.render('Home', { newUser: true, message: "Registered Successfully! Try to Login!!" });
    } else {
    res.render('Home', { newUser:false, message: "Registeration Failed!!" });
    }
})

app.get('/login', (req, res) => {
    res.render('Login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await Login.findOne({ username: username });
    if (!user) {
        return res.status(400).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        req.session.user = { id: user._id, username: user.username };
        res.redirect('/dashboard')
    } else {
        res.status(400).send('Incorrect password/Username');
    }
});




app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { username: req.session.user.username });
});

app.get('/logout',(req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.send("Error logging out.");
        }
        res.render('Home'); 
    });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
})
