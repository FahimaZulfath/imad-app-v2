/*function loadLoginForm () {
         var loginHtml = `  
            <div class="form-group">
                <input type="text" class="form-control" placeholder="Your Username *" id="username" required data-validation-required-message="Please enter your Username." />
            </div>
            <div class="form-group">
                <input type="password" class="form-control" placeholder="Your Password *" id="password" required data-validation-required-message="Please enter your Password." />
            </div>
            <div class="col-lg-12 text-center">
            <p>
                <button type="submit" id="login_btn" class="btn btn-xl">Log In</button>
            
                <button type="submit" id="register_btn" class="btn btn-xl">Register</button>
            </p>
            </div>
        `;
             
    document.getElementById('login_area').innerHTML = loginHtml;
    
    // Submit username/password to login
    var submit = document.getElementById('login_btn');
    submit.onclick = function () {
        // Create a request object
        var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
              // Take some action
              if (request.status === 200) {
                  //alert('Logged in successfully!');
                  submit.value = 'Success!';
              } else if (request.status === 403) {
                  submit.value = 'Invalid credentials. Try again?';
              } else if (request.status === 500) {
                  alert('Something went wrong on the server');
                  submit.value = 'Login';
              } else {
                  alert('Something went wrong on the server');
                  submit.value = 'Login';
              }
              loadLogin();
          }  
          // Not done yet
        };
        
        // Make the request
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        if (username === '' || password === '') {
              alert("Username/Password field can't be left empty");
              return;
          }
        request.open('POST', '/login', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({username: username, password: password}));  
        submit.innerHTML= 'Logging in...';
        
    };
    
    var register = document.getElementById('register_btn');
    register.onclick = function () {
        // Create a request object
        var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
              // Take some action
              if (request.status === 200) {
                  alert('User created successfully');
                  register.innerHTML = 'Registered!';
              } else {
                  alert('Could not register the user');
                  register.value = 'Register';
              }
          }
        };
        
        // Make the request
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
     if (username === '' || password === '') {
        alert("Username/Password field can't be left empty");
        return;
    }
        request.open('POST', '/create-user', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({username: username, password: password}));  
        register.innerHTML = 'Registering...';
    
    };
}


function loadLoggedInUser (username) {
    var loginArea = document.getElementById('login_area');
    loginArea.innerHTML = `
       <div class="logout"> 
       <h3> Welcome <i>${username}!</i></h3>
       <p>I'm Prigle. I was developed by Fahima Zulfath through IMAD-MOOC. You can look for sweet articles here. I'm happy to say that you are one of the member of Prigle user. Post your Valuable comments about me and articles in Portfolio. You can express your idea to give updates to prigle.</p>
       </div>
        <div>
         <button type="submit" id="logout" class="btn btn-xl" onclick="window.location='/logout'"> Logout
         </button>
         </div>
        
        `;
}

function loadLogin () {
    // Check if the user is already logged in
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                loadLoggedInUser(this.responseText);
            } else {
                loadLoginForm();
            }
        }
    };
    
    request.open('GET', '/check-login', true);
    request.send(null);
}



function loadArticles () {
        // Check if the user is already logged in
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            var articles = document.getElementById('articles');
            if (request.status === 200) {
                var articleData = JSON.parse(this.responseText);
                var content = '';
                for (var i=0; i< articleData.length; i++) {
                     content += `
                            <div class="col-md-4 col-sm-6 portfolio-item">
                                <a href="articles/${articleData[i].title}" class="portfolio-link" data-toggle="modal">
                                    <div class="portfolio-hover">
                                        <div class="portfolio-hover-content">
                                          <i class="fa fa-plus fa-3x"></i>
                                        </div>
                                     </div>
                                    <div class="portfolio-caption">
                                         <h4>${articleData[i].heading}</h4>
                                         <p class="text-muted">${articleData[i].date.split('T')[0]}</p>
                                    </div>
                                </a>
                           </div>
      `;
                }
               articles.innerHTML = content;
            } else {
                articles.innerHTML = 'Oops! Could not load all articles!';
            }
        }
    };
    request.open('GET', '/get-articles', true);
    request.send(null);
}
// The first thing to do is to check if the user is logged in!
loadLogin();

// Now this is something that we could have directly done on the server-side using templating too!
loadArticles();


