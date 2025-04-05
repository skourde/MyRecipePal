const db = require('./../services/db');

class Category {
    category_id;
    category_name;

    constructor(category_id, category_name) {
        this.category_id = category_id;
        this.category_name = category_name;
    }

    static async getAllCategories() {
        const sql = "SELECT category_id, category_name FROM category";
        const results = await db.query(sql);
        return results.map(row => new Category(row.category_id, row.category_name));
    }
}

module.exports = { Category };