const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var session = require('express-session');
var sqlinjection = require('sql-injection');

const app = express();


const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
 
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // start blocking after 5 requests
  message:
    "Prea multe încercări de la același IP, mai încercați peste o oră"
});


/*app.configure(function() {
    app.use(sqlinjection);  // add sql-injection middleware here
});*/

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(session({
	secret:'secret',
	resave:false,
	saveUninitialized:false,
	cookie:{
	maxAge:null
	}}));
	
//defining blacklist
var BLACKLIST =['192.0.0.1'];


	  

const port = 6789;


app.use(function(req, res, next) {
	res.locals.numeLogat = req.session.numeLogat;
	res.locals.id=req.session.id;
	next();
  });
  
  

// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res

// LAB 10
//app.get('/', (req, res) => res.send('Hello World'))

const fs=require('fs');

app.get('/', (req,res) => {

	console.log("ACASA");
	

	if ( req.session.numeLogat!="admin")
				{ 
					res.render('index',{utilizator: req.cookies.utilizator});}
				else {
					
					res.render("indexadmin",{utilizator: req.cookies.utilizator});
				}
	

});


app.get('/lista',(req,res) => {
	console.log("LISTA");
	res.render('lista');
});


app.get('/autentificare',createAccountLimiter, (req, res) => {
	console.log("AUTENTIFICARE");
	
	//res.clearCookie(mesajEroare);
	res.render('autentificare',{mesajEroare:req.cookies.mesajEroare});
	console.log(req.cookies.mesajEroare);
}); 




app.post('/verificare-autentificare', (req, res) => {
	

	fs.readFile('utilizatori.json',(err,data) => {
		
		if(err) throw err;
		console.log("VERIFICARE AUTENTIFICARE");
		console.log("REQ BODY"+ req.body);
		var users=JSON.parse(data);
		var i=0;
		let ok=0;
		
		for(i in users.utilizatori) {
			if(req.body.utilizator==users.utilizatori[i].utilizator && req.body.parola==users.utilizatori[i].parola)
			{
				ok=1;
			}
			console.log(ok);
		}
		if(ok ==0){
			
			console.log("Nume utilizator sau parola incorecte");
			
			res.cookie('mesajEroare','Nume utilizator sau parola incorecte',{maxAge:1*60000});
		
			res.redirect('/autentificare');
			
		}
		else{
			console.log("Autentificare corecta!");
			req.session.numeLogat = req.body.utilizator;
			req.session.nume=req.body.nume;
			req.session.prenume=req.body.prenume;
			console.log(req.session.numeLogat);
			
			res.cookie('utilizator', req.body.utilizator,{maxAge:2*60000});
			res.redirect("/");
		}
	});
	
});




app.get('/delogare',  function (req, res, next)  {
	if (req.session) {
	  // delete session object
	  req.session.destroy(function (err) {
		if (err) {
		  return next(err);
		} else {

		  return res.redirect('/');
		}
	  });
	}
});



app.use(express.static(__dirname + '/views'));

//app.use("../js", express.static('../js/'));

app.get('/erza',function(req,res) {
	
	res.sendFile(path.join(__dirname+'/erza.html'));
});

app.get('/sasuke',function(req,res) {
	
	res.sendFile(path.join(__dirname+'/sasuke.html'));
});

app.get('/mikasa',function(req,res) {
	
	res.sendFile(path.join(__dirname+'/mikasa.html'));
});

// Geting client IP
var getClientIp = function(req) {
	var ipAddress = req.connection.remoteAddress;
	if (!ipAddress) {
		return '';
	  }
	  // convert from "::ffff:192.0.0.1"  to "192.0.0.1"
  	if (ipAddress.substr(0, 7) == "::ffff:") {
    ipAddress = ipAddress.substr(7)
	}
	return ipAddress;
};

//Blocking Client IP, if it is in the blacklist
app.use(function(req, res, next) {
	var ipAddress = getClientIp(req);
	if(BLACKLIST.indexOf(ipAddress) === -1){
		next();
	  } else {
		res.send(ipAddress + ' IP nu este in whiteList')
	}
});


app.listen(port, () => console.log("Serverul rulează la adresa http://localhost:"));