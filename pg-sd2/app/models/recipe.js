// Get the functions in the db.js file to use
const db = require('../services/db');

class Recipe {
    //recipe id
    recipe_id;

    //recipe title
    title;

    constructor(recipe_id, title) {
        this.recipe_id = recipe_id;
        this.title = title;
    }

    async getRecipeTitle() {
        if (typeof this.title !== 'string') {
            var sql = "SELECT * FROM recipe WHERE recipe_title = ?"
            const results = await db.query(sql, [this.recipe_id]);
            this.title = results[0].title;
            this.recipe_id = results[0].recipe_id;
        }
    }
}

module.exports = {
    Recipe
}
