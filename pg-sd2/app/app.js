// Import express.js
const express = require("express");
// Import multer for handling file uploads
const multer = require("multer");
const path = require("path");

const axios = require('axios');

// Import express-session middleware for managing user sessions
const session = require('express-session');

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Create a route so that the user input can be captured in the backend
app.use(express.urlencoded({ extended: true}));

// Set up session middleware
// This will allow us to store user data (like user ID) across multiple requests
app.use(session({
    secret: 'yourSecretKey',  // Secret key used to sign the session ID cookie (change this for production)
    resave: false,            // Do not save session if nothing changed
    saveUninitialized: false  // Do not create empty sessions
  }));

// Middleware to make loggedIn status available to all templates
app.use(function(req, res, next) {
    res.locals.loggedIn = !!req.session.userId; // true if user is logged in, false if not
    next();
});

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Get the functions in the db.js file to use
const db = require('./services/db');

// Get the user model
const { User } = require("./models/user");

// Get the recipe model
const { Recipe } = require("./models/recipe");

// Get the category model
const { Category } = require("./models/category");

// Get the like model
const { Like } = require('./models/like'); 

// Get the comment model
const { Comment } = require('./models/comment');

// Define route for homepage
app.get("/homepage", async function (req, res) {
    try {
        const recipes = await Recipe.getFeaturedRecipes();
        res.render("homepage", {
            recipes: recipes || []
        });
    } catch (err) {
        console.error('Error fetching featured recipes:', err);
        res.render("homepage", {
            recipes: []
        });
    }
});

//set up multer storage
const storage = multer.diskStorage ({
    destination: function (req, file, cb) {
        cb(null, "./static/uploads"); //image uploads will be stored here
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage:storage});

app.get('/recipes-list', (req, res) => {
    const searchQuery = req.query.search || ''; // Get search query from URL
    
    // Filter recipes based on title (case-insensitive search)
    const filteredRecipes = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    res.render('recipes-list', { recipes: filteredRecipes });
  });

//User list page
app.get("/user-list", async function(req, res) {
    try {
        const users = await User.getAllUsers();
        res.render('user-list', { data: users });
    } catch (err) {
        console.error("Error fetching users:", err);
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
    console.log(user);
    res.render('user-profile', {user:user});
});

app.get("/myaccount", function (req, res) {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    res.redirect(`/myaccount/${req.session.userId}`);
});

app.get("/myaccount/:id", async function (req, res) {
    const userIdFromUrl = req.params.id;

    // Check if the user is logged in (verify session)
    if (!req.session.userId) {
        return res.redirect("/login");  // Redirect to login if not logged in
    }

    // Check if the logged-in user's ID matches the ID in the URL
    if (req.session.userId !== parseInt(userIdFromUrl)) {
        return res.status(403).send("You are not authorized to view this page.");
    }

    // Fetch user data
    try {
        const user = new User(userIdFromUrl);
        await user.getUserDetails();
        await user.getUserRecipes();

        const categories = await db.query("SELECT * FROM category");
        res.render("myaccount", { user: user, categories: categories });
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).send("Error fetching user profile.");
    }
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

app.post("/login", async function (req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("Please fill all required fields.");
        }

        const user = await User.findByEmailAndPassword(email, password);

        if (user) {
            // Store user ID inside session to keep user logged in
            req.session.userId = user.user_id;
            console.log("User logged in:", user.firstName);
            res.redirect("/homepage"); // later we can redirect to profile
        } else {
            console.log("Login failed for:", email);
            res.status(401).send("Invalid email or password.");
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send("Error during login.");
    }
});

// Logout route
app.get("/logout", function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.error("Error destroying session:", err);
        }
        res.redirect("/login"); // Redirect to login page after logout
    });
});
    
//Sign in page
app.get("/signup", function (req, res){
    res.render("sign-up");
    });

// POST route for handling user sign-up
app.post("/signup", async function (req, res) {
    try {
        const { fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            return res.status(400).send("Please fill all required fields.");
        }

        await User.createUser(fullname, email, password);

        console.log("New user inserted:", fullname);

        res.redirect("/login");

    } catch (err) {
        console.error("Error signing up:", err);
        res.status(500).send("Error signing up user.");
    }
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
        console.error("Database Query Error:", err);
        res.status(500).send("Error fetching recipes for this category");
    }
});

//Single recipe - individual recipe details
app.get("/recipes/:id", async function (req, res) {
    const recipeId = req.params.id;

    try {
        const recipe = await Recipe.getRecipeById(recipeId);
        const comments = await Comment.getCommentsByRecipe(recipeId);

        if (recipe) {
            res.render("recipes", { recipe: recipe, comments: comments, userId: req.session.userId || null });
        } else {
            res.status(404).send("Recipe not found");
        }
    } catch (err) {
        console.error("Database Query Error:", err);
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

//posting a recipe
app.post("/submit-recipe/:userId", upload.single("image"), async (req, res) => {
    const user_id = req.params.userId;

  try {
    const recipe = await Recipe.create ({
      title: req.body.title,
      description: req.body.description,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      image: req.file ? "/uploads/" + req.file.filename : null,
      user_id: user_id,
      category_id: req.body.category_id || null,
    });

    res.redirect(`/myaccount/${user_id}`);
  } catch (err) {
    console.error("Failed to save recipe:", err);
    res.status(500).send("There was an error submitting your recipe.");
  }
});

// Route for liking a recipe
app.post("/like/:recipeId", async function (req, res) {
    const userId = req.session.userId;
    const recipeId = req.params.recipeId;

    if (!userId) {
        return res.status(401).send("Unauthorized: Please log in to like a recipe.");
    }

    try {
        const alreadyLiked = await Like.hasUserLiked(userId, recipeId);

        if (alreadyLiked) {
            // Optional: remove like if already liked (toggle like/unlike)
            await Like.removeLike(userId, recipeId);
            console.log(`User ${userId} removed like from recipe ${recipeId}`);
        } else {
            await Like.addLike(userId, recipeId);
            console.log(`User ${userId} liked recipe ${recipeId}`);
        }

        res.redirect(`/recipes/${recipeId}`);
    } catch (err) {
        console.error("Error handling like:", err);
        res.status(500).send("Error processing like");
    }
});

// Post a comment on a recipe
app.post("/recipes/:id/comments", async function (req, res) {
    const recipeId = req.params.id;
    const userId = req.session.userId;  // Get the logged-in user's ID
    const { content } = req.body;       // Get the comment text from the form

    if (!userId) {
        return res.status(401).send("You must be logged in to post a comment.");
    }

    if (!content) {
        return res.status(400).send("Comment content cannot be empty.");
    }

    try {
        await Comment.addComment(userId, recipeId, content);
        res.redirect(`/recipes/${recipeId}`); // After posting, reload the recipe page
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).send("Error posting comment.");
    }
});

//deleting a comment
app.post("/comments/:id/delete", async function(req, res) {
    const commentId = req.params.id;

    if (!req.session.userId) {
        return res.status(401).send("Unauthorized");
    }

    try {
        // Before deleting, you should ideally check if the comment belongs to the user.
        const sql = `SELECT * FROM comment WHERE comment_id = ?`;
        const results = await db.query(sql, [commentId]);
        
        if (results.length > 0) {
            const comment = results[0];
            if (comment.user_id === req.session.userId) {
                await Comment.deleteComment(commentId);
                res.redirect("back");  // Go back to the recipe page
            } else {
                res.status(403).send("You are not allowed to delete this comment.");
            }
        } else {
            res.status(404).send("Comment not found.");
        }

    } catch (err) {
        console.error("Error deleting comment:", err);
        res.status(500).send("Error deleting comment.");
    }
});


//deleting a recipe
app.post("/recipes/delete/:id", async function (req, res) {
    const recipeId = req.params.id;

    if (!req.session.userId) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const deleted = await Recipe.deleteById(recipeId);

        if (deleted) {
            console.log("Recipe deleted:", recipeId);
            res.redirect(`/myaccount/${req.session.userId}`);
        } else {
            res.status(404).send("Recipe not found or already deleted");
        }
    } catch (err) {
        console.error("Error deleting recipe:", err);
        res.status(500).send("Error deleting recipe");
    }
});

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});

// Test session route
app.get("/session-test", function (req, res) {
    if (req.session.userId) {
      res.send(`Session is active! User ID: ${req.session.userId}`);
    } else {
      res.send("No active session. Please log in.");
    }
  });

  app.get("/search-foods", async function (req, res) {
    const clientId = "8488278ddc8f426a899e509fddeb61e1";
    const clientSecret = "7240aac69c9e448facef3f8c8c1e0170";
    const searchTerm = req.query.q;

    if (!searchTerm) {
        // If no search term, render empty page (no API call yet)
        return res.render('search-foods', { foods: [] });
    }

    try {
        const tokenResponse = await axios({
            method: 'post',
            url: 'https://oauth.fatsecret.com/connect/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
                username: clientId,
                password: clientSecret
            },
            data: 'grant_type=client_credentials'
        });

        const accessToken = tokenResponse.data.access_token;

        const foodResponse = await axios({
            method: 'get',
            url: 'https://platform.fatsecret.com/rest/server.api',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                method: 'foods.search',
                search_expression: searchTerm,
                format: 'json'
            }
        });

        const foods = foodResponse.data.foods.food || [];

        res.render('search-foods', { foods: foods });

    } catch (err) {
        console.error("Error calling FatSecret API:", err.response ? err.response.data : err.message);
        res.status(500).send("Error calling FatSecret API");
    }
});
