// Get the functions in the db.js file to use
const db = require('./../services/db');

// Get the recipe model
const { Recipe } = require("./recipe");

class User {
    //user id
    user_id;

    //user first name
    firstName;

    //user recipes
    recipe = [];

    constructor(user_id) {
        this.user_id = user_id;
    }

    //gets the user's name from the database
    async getUserDetails() {
        if (typeof this.firstName !== 'string') {
            var sql = "SELECT * FROM user WHERE user_id =?"
            const results = await db.query(sql, [this.user_id]);
            if (results.length > 0) {
                this.firstName = results[0].firstName
            }
        }
    }

    //gets the recipes of this user
    async getUserRecipes() {
        var sql = "SELECT * FROM recipe WHERE user_id = ?"
        const results = await db.query(sql, [this.user_id]);
        for (var row of results) {
            this.recipe.push(new Recipe(row.recipe_id, row.title));
        }
    }

}

module.exports = {
    User
}