// app/routes.js

var mysql = require('mysql');
var dbconfig = require('./config/database');
var connection = mysql.createConnection(dbconfig.connection);
var overview_pw = "beauty";

connection.query('USE ' + dbconfig.database);

module.exports = function(app, passport) {

	app.get('/', isLoggedIn, function(req, res) {
		connection.query("SELECT bid, cid FROM Users where uid = ?", [req.user.uid], function(err, rows) {
			if (err) console.log(err);
			connection.query("SELECT * FROM Classes", function(err2, rows2) {
				if (err2) console.log(err2);
				res.render('index.ejs', {mycid : rows[0].cid, classlist : rows2});
			})
		})
	});

	app.get('/login', function(req, res) {
		var loginMessage = req.flash('loginMessage');
		var name = req.flash('name');
		var earth = req.flash('earth');
		var campus = req.flash('campus');
		var year = req.flash('year');
		res.render('login.ejs', {wrong : (loginMessage.length != 0), login_message : loginMessage, name : name, earth : earth, campus : campus, year : year});
	});

	app.post('/login', passport.authenticate('local-login', { successRedirect : '/', failureRedirect : '/' }));


	app.get('/logout', isLoggedIn, function(req, res) {
		req.logOut();
		res.redirect('/');
	});

	app.get('/deleteAccount', function(req, res) {
		connection.query("DELETE FROM Users WHERE id = ?", [req.user.uid], function(err, rows) {
			console.log(rows);
			console.log(err);
			req.logOut();
			res.redirect('/');
		})
	});

	app.get('/details', isLoggedIn, function(req, res) {
		connection.query("SELECT * FROM Classes where cid = ?", [req.query.cid], function(err1, rows1) {
			if (err1)
				console.log(err1);
			if (rows1.length == 0)
				res.redirect('/confirm?t=de');
			else {
				connection.query("SELECT * FROM Users where uid = ? and cid = ?", [req.user.uid, req.query.cid], function(err2, rows2) {
					if (err2)
						console.log(err2);
					res.render('detail.ejs', {classinfo : rows1[0], registered : (rows2.length > 0)});
				});
			}
		});
	});

	app.get('/cancel', isLoggedIn, function(req, res) {
		connection.query("SELECT cid from Users where uid = ?", [req.user.uid], function(err, rows) {
			if (err)
				res.redirect('/confirm?t=e');
			else if (rows[0].cid == null || rows[0].cid != req.query.cid)
				res.redirect('/confirm?t=cet');
			else {
				connection.query("UPDATE Classes SET current = (current - 1) where cid = ?", [req.query.cid], function(err1, rows1) {
					if (err1)
						res.redirect('/confirm?t=ce');
					else {
						connection.query("UPDATE Users SET cid = null where uid = ?", [req.user.uid], function(err, rows) {
							if (err)
								res.redirect('/confirm?t=e');
							else
								res.redirect('/confirm?t=cs');
						})
					}
				})
			}
		})
	})

	app.get('/register', isLoggedIn, function(req, res) {
		connection.query("SELECT cid from Users where uid = ?", [req.user.uid], function(err, rows) {
			if (err)
				res.redirect('/confirm?t=e');
			else if (rows[0].cid == req.query.cid)
				res.redirect('/confirm?t=ret');
			else if (rows[0].cid != null)
				res.redirect('/confirm?t=red');
			else {
				connection.query("UPDATE Classes SET current = (current + 1) where cid = ?", [req.query.cid], function(err1, rows1) {
					if (err1)
						res.redirect('/confirm?t=ref');
					else {
						connection.query("UPDATE Users SET cid = ? where uid = ?", [req.query.cid, req.user.uid], function(err, rows) {
							if (err)
								res.redirect('/confirm?t=e');
							else
								res.redirect('/confirm?t=rs');
						})
					}
				})
			}
		})
	})

	app.get('/confirm', isLoggedIn, function(req, res){
		res.render('confirm.ejs', {t : req.query.t});
	});

	app.get('/my', isLoggedIn, function(req, res) {
		connection.query("SELECT cid, bid FROM Users where uid = ?", [req.user.uid], function(err, rows) {
			connection.query("SELECT * FROM Classes where cid = ?", [rows[0].cid], function(err1, rows1) {
				if (err || err1)
					res.redirect('/confirm?t=e');
				var creg = true;
				if (!rows1.length)
					creg = false;
				res.render('my.ejs', {creg : creg, classinfo : rows1[0]});
			})
		})
	});

	app.get('/overview', function(req, res) {
		res.render('overviewauthenticate.ejs', {wrong : false});
	});

	app.post('/overview', function(req, res) {
		if (req.body.password == overview_pw) {
			connection.query("SELECT cid, title FROM Classes", function(err1, classes) {
				if (err1) console.log(err1);
				connection.query("SELECT name, campus, cid, bid FROM Users", function(err, rows) {
					var classlist = [["미신청"]];
					for (i in classes)
						classlist.push([classes[i].title]);
					for (p in rows) {
						classlist[rows[p].cid==null ? 0 : rows[p].cid].push({name : rows[p].name, campus : rows[p].campus});
					}
					// for (c in classlist)
					// 	classlist[c] = classlist[c].sort(nameCompare);
					res.render('overview.ejs', {classlist : classlist});
				})
			})
		}
		else {
			res.render('overviewauthenticate.ejs', {wrong : true});
		}
	})

};

function nameCompare(a, b){
	if (a.name == undefined || b.name == undefined)
		return 0;
	if (a.name < b.name)
		return -1 
	if (a.name > b.name)
		return 1
	return 0
}

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/login');
}
