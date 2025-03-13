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

// Define route for homepage
app.get("/homepage/", function(req, res) {
    var sql = `
        SELECT 
            category.category_id,  
            category.category_name, 
            (
                SELECT recipe.image
                FROM recipe
                WHERE recipe.category_id = category.category_id
                ORDER BY RAND()
                LIMIT 1
            ) AS image
        FROM category;
    `;

    db.query(sql).then(results => {
        console.log("🔎 Query Results:", results); // Log database results

        if (!results || results.length === 0) {
            console.warn("⚠️ No recipes found in the database!");
        }

        res.render('homepage', { categories: results }); // Renamed to "categories"
    }).catch(err => {
        console.error("❌ Database Query Error:", err);
        res.status(500).send("Error fetching recipes");
    });
});

//User list page
app.get("/user-list", function(req, res) {
    var sql = 'SELECT * FROM user';
    db.query(sql).then(results => {
        res.render('user-list', {data:results});
    });
});

//User profile page
app.get("/user-profile/:id", async function(req, res) {
    var UID = req.params.id;
    //create user class with the ID passed
    var user = new User(UID);
    await user.getUserDetails();
    await user.getUserRecipes();
    //await user.getUserLikes();
    //await user.getUserComments();
    console.log(user);
    res.render('user-profile', {user:user});
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

//Log in page
app.get("/login", function (req, res){
    res.send("This will be the log in page");
    });

//Sign in page
app.get("/signup", function (req, res){
    res.send("This will be the sign up page");
    });

//About us page
app.get("/aboutus", function (req, res){
    res.send("This will be the about us page");
    });

//Listing page (Recipes list)
app.get("/recipes/", function (req, res){
    var sql = "SELECT recipe_id, title, image FROM recipe";
    db.query(sql).then(results => {
        res.render("recipes-list", {recipes: results});
    });
});

//Single recipe - individual recipe details
app.get("/recipes/:id", function (req, res) {
    var recipeId = req.params.id;
    var sql = `
      SELECT recipe.*, 
             user.FirstName AS user_firstname,
             (SELECT COUNT(*) FROM likes WHERE likes.recipe_id = recipe.recipe_id) AS like_count
      FROM recipe
      JOIN user ON recipe.user_id = user.user_id
      WHERE recipe.recipe_id = ?`;
      
    db.query(sql, [recipeId]).then(results => {
        res.render("recipes", {
            recipe: results[0]
        }); 
    }).catch(err => {
        console.error("❌ Database Query Error:", err);
        res.status(500).send("Error fetching recipe details");
    });
});


//Categories page
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