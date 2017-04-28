var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
  
  user: 'fahimazulfath',
  database: 'fahimazulfath',
  host: 'db.imad.hasura-app.io',
  port: '5432',
  password: process.env.DB_PASSWORD,
  
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/ui'));
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30}
}));

function createTemplate (data){
    
 var title =data.title;
 var date =data.date;
 var background = data.background;
 var heading =data.heading;
 var content =data.content;
 
 var htmlTemplate = `<html>
     <head>
       <title>
           ${title}
       </title>
        <meta name="viewport" content="Width-device-width, initial-scale-1"/>
        <link href="/ui/style.css" rel="stylesheet" />
   </head>   
     <body>
     <div class="portfolio-modal modal fade"  tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
                <a href="http://fahimazulfath.imad.hasura-app.io/#portfolio">
                <div class="close-modal" data-dismiss="modal">
                    <div class="lr">
                        <div class="rl">
                        </div>
                    </div>
                    </a>
                </div>
                <div class="container">
                    <div class="row">
                        <div class="col-lg-8 col-lg-offset-2">
                            <div class="modal-body">
                                <!-- Project Details Go Here -->
                                <h2>${heading}</h2>
                                <p class="item-intro text-muted">${date.toDateString()}</p>
                                <img class="img-responsive img-centered" src="../ui/images/${background}" alt="">
                                <p>${content}</p>
                                <a href="http://fahimazulfath.imad.hasura-app.io/#portfolio">
                                <button type="button" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-times"></i>
                                 Close Article </button></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h4>Post your valuable feedbacks</h4>
            <div id="comment_form"></div>
            <div id="comments">
                <center>Loading comments...</center>
            </div>
        </div>
    </div>
    <script type="text/javascript" src="/ui/article.js"></script>
     </body>
   </html>
  `;
  return htmlTemplate;
}
var pool = new Pool(config);
app.get('/test-db',function (req, res){
    
  
 pool.query("SELECT * FROM test", function(err,result){  
     if(err){
           res.status(500).send(err.toString());
       }else{
           res.send(JSON.stringify(result.rows));
           }
 });
           

   });
   
   app.get('/articles/:articleName',function (req, res){
    
  
 pool.query("SELECT * FROM article WHERE title =$1", [req.params.articleName], function(err,result){  
     if(err){
           res.status(500).send(err.toString());
       }else{
           if(result.rows.length === 0){
             res.status(404).send('Article not found');  
           }else{
               var articleData = result.rows[0];
               res.send(createTemplate(articleData));
           }
       }
   });
  });
app.get('/articles/:articleName',function (req, res){
    //articleName == article-one
  
 pool.query("SELECT * FROM article WHERE title =$1", [req.params.articleName], function(err,result){  
     if(err){
           res.status(500).send(err.toString());
       }else{
           if(result.rows.length === 0){
             res.status(404).send('Article not found');  
           }else{
               var articleData = result.rows[0];
               res.send(createTemplate(articleData));
           }
       }
   });
  });
  
function hash (input, salt) {
    // How do we create a hash?
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

app.get('/hash/:input',function (req,res){
    var hashedString = hash(req.params.input, 'this-is-some-random-string');
    res.send(hashedString);
});

app.post('/create-user', function (req, res) {
   // username, password
   // {"username": "username", "password": "password"}
   // JSON request
   var username = req.body.username;
   var password = req.body.password;
   var salt = crypto.randomBytes(128).toString('hex');
   var dbString = hash(password, salt);
   pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send('User successfully created: ' + username);
      }
   });
});

app.post('/login', function (req, res) {
   var username = req.body.username;
   var password = req.body.password;
   pool.query('SELECT * FROM "user" WHERE username = $1', [username], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          if (result.rows.length === 0) {
              res.status(403).send('username/password is invalid');
          } else {
              // Match the password
              var dbString = result.rows[0].password;
              var salt = dbString.split('$')[2];
              var hashedPassword = hash(password, salt); // Creating a hash based on the password submitted and the original salt
              if (hashedPassword === dbString) {
                // Set the session
                req.session.auth = {userId: result.rows[0].id};
                // set cookie with a session id
                // internally, on the server side, it maps the session id to an object
                // { auth: {userId }}
                res.send('credentials correct!');
                
              } else {
                res.status(403).send('username/password is invalid');
              }
          }
      }
   });
});

app.get('/check-login', function (req, res) {
   if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
    
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(result.rows[0].username);    
           }
       });
   } else {
      res.status(400).send('You are not logged in');
   }
});

app.get('/logout', function (req, res) {
   delete req.session.auth;
   res.status(200).redirect('/?msg=logged%20out');
});

var pool = new Pool(config);

app.get('/get-articles', function (req, res) {
   // make a select request
   // return a response with the results
   pool.query('SELECT * FROM article ORDER BY date DESC', function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});

app.get('/get-comments/:articleName', function (req, res) {
   // make a select request
   // return a response with the results
   pool.query('SELECT comment.*, "user".username FROM article, comment, "user" WHERE article.title = $1 AND article.id = comment.article_id AND comment.user_id = "user".id ORDER BY comment.timestamp DESC', [req.params.articleName], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});

app.post('/submit-comment/:articleName', function (req, res) {
   // Check if the user is logged in
    if (req.session && req.session.auth && req.session.auth.userId) {
        // First check if the article exists and get the article-id
        pool.query('SELECT * from article where title = $1', [req.params.articleName], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if (result.rows.length === 0) {
                    res.status(400).send('Article not found');
                } else {
                    var articleId = result.rows[0].id;
                    // Now insert the right comment for this article
                    pool.query(
                        "INSERT INTO comment (comment, article_id, user_id) VALUES ($1, $2, $3)",
                        [req.body.comment, articleId, req.session.auth.userId],
                        function (err, result) {
                            if (err) {
                                res.status(500).send(err.toString());
                            } else {
                                res.status(200).send('Comment inserted!');
                            }
                        });
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can comment');
    }
});



/*var counter = 0;
app.get('/counter',function (req, res){
    counter = counter + 1;
    res.send(counter.toString());
});
var pool = new Pool(config);
app.get('/test-db', function(req,res) {
   pool.query('SELECT * FROM test',function(err,result){
     if(err) {
         res.statues(500).send(err.ToString());
     } else{
         res.send(JSON.stringify(result.rows));
     }
   });
});*/



app.get('/', function (req, res) {
   res.sendFile(path.join(__dirname, 'ui', 'index.html')); 
});


app.get('/ui/style.css', function (req, res) {
   res.sendFile(path.join(__dirname, 'ui', 'style.css')); 
});

app.get('/ui/fixednavbar.css', function (req, res) {
   res.sendFile(path.join(__dirname, 'ui', 'fixednavbar.css')); 
});

app.get('/ui/prigle.css', function (req, res) {
   res.sendFile(path.join(__dirname, 'ui', 'prigle.css')); 
});

app.get('/ui/main.js', function (req, res) {
   res.sendFile(path.join(__dirname, 'ui', 'main.js')); 
});

app.get('/ui/article.js', function (req, res) {
   res.sendFile(path.join(__dirname, 'ui', 'article.js')); 
});

app.get('/ui/bootstrap.js', function (req, res) {
   res.sendFile(path.join(__dirname, 'ui', 'bootstrap.js')); 
});

app.get('/ui/jquery.js', function (req, res) {
   res.sendFile(path.join(__dirname, 'ui', 'jquery.js')); 
});

app.get('/ui/article.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'article.jpg'));
});

app.get('/ui/images/applogo.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/images', 'applogo.jpg'));
});
app.get('/ui/images/hd-photography-wallpapers-2.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/images', 'hd-photography-wallpapers-2.jpg'));
});
app.get('/ui/images/Nice-Photography-HD-Wallpaper.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/images', 'Nice-Photography-HD-Wallpaper.jpg'));
});

app.get('/ui/images/header.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/images', 'header.jpg'));
});
app.get('/ui/images/moz.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/images', 'moz.jpg'));
});
app.get('/ui/images/dgctlogo.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/images', 'dgctlogo.jpg'));
});
app.get('/ui/images/madi.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/images', 'madi.jpg'));
});
app.get('/ui/images/web26.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/images', 'web26.jpg'));
});
app.use(express.static('public'));
          app.use('/ui',express.static(__dirname+'/ui'));



var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
