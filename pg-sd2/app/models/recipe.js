// Get the functions in the db.js file to use
const db = require('./../services/db');

class Recipe {
    recipe_id;
    title;
    description;
    image;
    user_id;
    category_id;
    ingredients;
    instructions;
    user_firstname; 
    like_count; 
    category_name;

    constructor(recipe_id, title, description, image, user_id, category_id, ingredients, instructions, user_firstname, like_count, category_name) {
        this.recipe_id = recipe_id;
        this.title = title;
        this.description = description;
        this.image = image;
        this.user_id = user_id;
        this.category_id = category_id;
        this.ingredients = ingredients;
        this.instructions = instructions;
        this.user_firstname = user_firstname;
        this.like_count = like_count;
        this.category_name = category_name;
    }

    static async getAllRecipes() {
        const sql = "SELECT recipe_id, title, image FROM recipe";
        const results = await db.query(sql);
        return results.map(row => new Recipe(row.recipe_id, row.title, null, row.image));
    }

    static async getRecipeById(recipeId) {
        const sql = `
          SELECT recipe.*, 
                 user.firstName AS user_firstname,
                 (SELECT COUNT(*) FROM likes WHERE likes.recipe_id = recipe.recipe_id) AS like_count
          FROM recipe
          JOIN user ON recipe.user_id = user.user_id
          WHERE recipe.recipe_id = ?`;
        const results = await db.query(sql, [recipeId]);
        if (results.length > 0) {
            const r = results[0];
            return new Recipe(r.recipe_id, r.title, r.description, r.image, r.user_id, r.category_id, r.ingredients, r.instructions);
        }
        return null;
    }

    static async getRecipesByCategory(categoryId) {
        const sql = `
          SELECT recipe.*, 
                 user.firstName AS user_firstname,
                 (SELECT COUNT(*) FROM likes WHERE likes.recipe_id = recipe.recipe_id) AS like_count,
                 category.category_name
          FROM recipe
          JOIN user ON recipe.user_id = user.user_id
          JOIN category ON recipe.category_id = category.category_id
          WHERE recipe.category_id = ?`;
        const results = await db.query(sql, [categoryId]);
        return results.map(row => new Recipe(row.recipe_id, row.title, row.description, row.image, row.user_id, row.category_id, row.ingredients, row.instructions, row.user_firstname, row.like_count, row.category_name));
    }
}

module.exports = { Recipe };
