const db = require('./../services/db');

class Recipe {
    recipe_id;
    title;
    description;
    ingredients;
    instructions;
    image;
    user_id;
    category_id;
    user_firstname;
    like_count;
    category_name;

    constructor(recipe_id, title, description, ingredients, instructions, image, user_id, category_id, user_firstname, like_count, category_name) {
        this.recipe_id = recipe_id;
        this.title = title;
        this.description = description;
        this.ingredients = ingredients;
        this.instructions = instructions;
        this.image = image;
        this.user_id = user_id;
        this.category_id = category_id;
        this.user_firstname = user_firstname;
        this.like_count = like_count;
        this.category_name = category_name;
    }

    //static method to create a new recipe in the database
    static async create(data) {
        const {
            title = null, 
            description = null, 
            ingredients = null, 
            instructions = null, 
            image = null, 
            user_id, 
            category_id = null
        } = data;

        //SQL query to insert the recipe into the database
        const sql = `
            INSERT INTO recipe 
            (title, description, ingredients, instructions, image, user_id, category_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            title,   
            description,     
            ingredients,     
            instructions,    
            image,           
            user_id,         
            category_id      
        ];

        try {
            //execute the database query
            const result = await db.query(sql, values);

            //create a Recipe instance with the new recipe_id
            const recipe = new Recipe(
                result.insertId, // The new recipe's ID
                title,
                description,
                ingredients,
                instructions,
                image,
                user_id,
                category_id,
                null,
                null,
                null
            );

            return recipe;
        } catch (err) {
            console.error("Error saving recipe:", err);
            throw err;
        }
    }

    // Fetch a recipe by its ID
    static async getRecipeById(recipeId) {
        const sql = `
          SELECT recipe.*, 
                 user.firstName AS user_firstname,
                 (SELECT COUNT(*) FROM likes WHERE likes.recipe_id = recipe.recipe_id) AS like_count,
                 category.category_name
          FROM recipe
          JOIN user ON recipe.user_id = user.user_id
          JOIN category ON recipe.category_id = category.category_id
          WHERE recipe.recipe_id = ?
        `;
        const results = await db.query(sql, [recipeId]);
        
        if (results.length > 0) {
            const r = results[0];
            return new Recipe(
                r.recipe_id,
                r.title,
                r.description,
                r.ingredients,
                r.instructions,
                r.image,
                r.user_id,
                r.category_id,
                r.user_firstname, 
                r.like_count,     
                r.category_name
            );
        }

        return null;
    }

    // Fetch all recipes from the database
    static async getAllRecipes() {
        const sql = "SELECT recipe_id, title, image FROM recipe";
        const results = await db.query(sql);
        return results.map(row => new Recipe(
            row.recipe_id,
            row.title,
            null,
            null,
            null,
            row.image,
            null,
            null,
            null,
            null,
            null
        ));
    }

    // Fetch recipes by category
    static async getRecipesByCategory(categoryId) {
        const sql = `
          SELECT recipe.*, 
                 user.firstName AS user_firstname,
                 (SELECT COUNT(*) FROM likes WHERE likes.recipe_id = recipe.recipe_id) AS like_count,
                 category.category_name
          FROM recipe
          JOIN user ON recipe.user_id = user.user_id
          JOIN category ON recipe.category_id = category.category_id
          WHERE recipe.category_id = ?
        `;
        const results = await db.query(sql, [categoryId]);
        return results.map(row => new Recipe(
            row.recipe_id,
            row.title,
            row.description,
            row.ingredients,
            row.instructions,
            row.image,
            row.user_id,
            row.category_id,
            row.user_firstname,
            row.like_count,
            row.category_name
        ));
    }

        // Fetch featured recipes (for homepage)
    static async getFeaturedRecipes() {
        const sql = `
            SELECT recipe.recipe_id, recipe.title, recipe.image, recipe.description, recipe.category_id, category.category_name
            FROM recipe
            JOIN category ON recipe.category_id = category.category_id
            LIMIT 5
        `;
        const results = await db.query(sql, []);

        return results.map(row => new Recipe(
            row.recipe_id,      // recipe_id
            row.title,          // title
            row.description,    // description
            null,               // ingredients (not selected)
            null,               // instructions (not selected)
            row.image,          // image
            null,               // user_id (not selected)
            row.category_id,    // category_id (available if you want, or null)
            null,               // user_firstname (not selected)
            null,               // like_count (not selected)
            row.category_name   // ✅ category_name properly!
        ));
    }

    //allow user to delete a recipe they posted
    static async deleteById(recipe_id) {
        const sql = `DELETE FROM recipe WHERE recipe_id = ?`;
        try {
            const result = await db.query(sql, [recipe_id]);
            return result.affectedRows > 0;
        } catch (err) {
            console.error("Error deleting recipe:", err);
            throw err;
        }
    }

}

module.exports = { Recipe };