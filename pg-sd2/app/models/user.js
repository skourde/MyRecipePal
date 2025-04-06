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
        this.recipe = [];
        for (var row of results) {
            this.recipe.push(new Recipe(row.recipe_id, row.title));
        }
    }

    static async getAllUsers() {
        const sql = 'SELECT * FROM user';
        const results = await db.query(sql);
        return results.map(row => {
            const user = new User(row.user_id);
            user.firstName = row.firstName; // manually assign first name
            return user;
        });
    }
    
    static async createUser(fullname, email, password) {
        const sql = `
            INSERT INTO user (role, password, email, firstName, lastName)
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.query(sql, [
            'user',        // default role
            password,      // plain password (later we hash it)
            email,         
            fullname,      // save fullname in firstName (for now)
            ''             // empty lastName
        ]);
    }
    static async findByEmailAndPassword(email, password) {
        const sql = `
            SELECT * FROM user
            WHERE email = ? AND password = ?
            LIMIT 1
        `;
        const results = await db.query(sql, [email, password]);
    
        if (results.length > 0) {
            const row = results[0];
            const user = new User(row.user_id);
            user.firstName = row.firstName;
            user.email = row.email;
            return user;
        } else {
            return null;
        }
    }
    

}

module.exports = {
    User
}