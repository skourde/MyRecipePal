// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Create a route so that the user input can be captured in the backend
app.use(express.urlencoded({ extended: true}));

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Get the functions in the db.js file to use
const db = require('./services/db');

// Get the user model
const { User } = require("./models/user");

// Create a route for root - /
app.get("/", function(req, res) {
    res.send("Hello world!");
});

/* Using MySQL with node.js */
//JSON formatted listing of users
app.get("/user-list", function(req, res) {
    var sql = 'select * from user';
    //as we are not inside an async function we cannot use await
    //so we use .then syntax to ensure that we wait until the promise returned by the async function is resolved before we proceed
    db.query(sql).then(results => {
        console.log(results);
        res.json(results)
    });
});

//display a formatted list of users
app.get("/user-list-formatted", function(req, res) {
    var sql = 'select * from user';
    db.query(sql).then(results => {
            res.render('user-list', {data: results});
    });
});

// Create a route for testing the db
app.get("/db_test", function(req, res) {
    // Assumes a table called test_table exists in your database
    sql = 'select * from test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.send(results)
    });
});

// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);
    //  Retrieve the 'name' parameter and use it in a dynamically generated page
    res.send("Hello " + req.params.name);
});

//Listing page (Recipes list)
app.get("/recipes/", function (req, res){
    var sql = "SELECT recipe_id, title, image FROM recipe";
    db.query(sql).then(results => {
        res.render("recipes-list", {recipes: results});
    });
});

//single recipe? details of the recipe
app.get("/recipes/:id", function (req, res){
    var recipeId = req.params.id;
    var sql = "SELECT recipe.*, user.FirstName AS user_firstname\
        FROM recipe  \
        JOIN user  ON recipe.user_id = user.user_id \
        WHERE recipe.recipe_id = ?";
    db.query(sql, [recipeId]).then(results => {
        res.render("recipes", {
            recipe: results[0]
        }); 
    });
});


app.get("/categories/", function(req, res){
    var sql = "SELECT category_id, category_name FROM category";
    db.query(sql).then(results => {
        res.render("categories", {categories: results});
    });
}); 



// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});