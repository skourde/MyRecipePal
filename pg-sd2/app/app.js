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

// Get the recipe model
const { Recipe } = require("./models/recipe");

//get the catergory model
const { Category } = require("./models/category");

// Define route for homepage
app.get("/homepage", async function (req, res) {
    try {
        const recipes = await Recipe.getFeaturedRecipes();
        res.render("homepage", { recipes: recipes });
    } catch (err) {
        console.error('Error fetching featured recipes:', err);
        res.render("homepage", { recipes: [] });
    }
});



//User list page
app.get("/user-list", async function(req, res) {
    try {
        const users = await User.getAllUsers();
        res.render('user-list', { data: users });
    } catch (err) {
        console.error("❌ Error fetching users:", err);
        res.status(500).send("Error fetching users");
    }
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
    res.render("login");
    });

//Sign in page
app.get("/signup", function (req, res){
    res.render("sign-up");
    });

//About us page
app.get("/aboutus", function (req, res){
    res.render("about-us");
    });

/*//Listing page (Recipes list)
app.get("/recipes/", function (req, res){
    var sql = "SELECT recipe_id, title, image FROM recipe";
    db.query(sql).then(results => {
        res.render("recipes-list", {recipes: results});
    });
});*/

// Listing page (Recipes list) with categories in the button
app.get("/recipes/", async function (req, res) {
    try {
        const recipes = await Recipe.getAllRecipes();
        const categories = await Category.getAllCategories();
        
        res.render("recipes-list", {
            recipes: recipes,
            categories: categories || []
        });
    } catch (err) {
        console.error('Error fetching recipes or categories:', err);
        res.status(500).send('Error fetching recipes or categories');
    }
});

// Single category - list recipes in the category
app.get("/categories/:id", async function (req, res) {
    const categoryId = req.params.id;

    try {
        const recipes = await Recipe.getRecipesByCategory(categoryId);

        if (recipes.length > 0) {
            res.render("category_recipes", {
                recipes: recipes,
                categoryName: recipes[0].category_name // because it's now inside the Recipe object!
            });
        } else {
            res.status(404).send("No recipes found for this category");
        }
    } catch (err) {
        console.error("❌ Database Query Error:", err);
        res.status(500).send("Error fetching recipes for this category");
    }
});


//Single recipe - individual recipe details
app.get("/recipes/:id", async function (req, res) {
    const recipeId = req.params.id;

    try {
        const recipe = await Recipe.getRecipeById(recipeId);

        if (recipe) {
            res.render("recipes", { recipe: recipe });
        } else {
            res.status(404).send("Recipe not found");
        }
    } catch (err) {
        console.error("❌ Database Query Error:", err);
        res.status(500).send("Error fetching recipe details");
    }
});



// Route for future possible Categories page
//app.get("/categories/", async function(req, res) {
//    try {
//        const categories = await Category.getAllCategories();
//        res.render("categories", { categories });
//    } catch (err) {
//        console.error("Error querying categories:", err);
//        res.status(500).send("Internal Server Error");
//    }
//});

 

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});