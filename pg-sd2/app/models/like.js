// app/models/like.js
const db = require('./../services/db');

class Like {
    static async addLike(userId, recipeId) {
        const sql = `
            INSERT INTO likes (user_id, recipe_id)
            VALUES (?, ?)
        `;
        await db.query(sql, [userId, recipeId]);
    }

    static async removeLike(userId, recipeId) {
        const sql = `
            DELETE FROM likes
            WHERE user_id = ? AND recipe_id = ?
        `;
        await db.query(sql, [userId, recipeId]);
    }

    static async hasUserLiked(userId, recipeId) {
        const sql = `
            SELECT * FROM likes
            WHERE user_id = ? AND recipe_id = ?
            LIMIT 1
        `;
        const results = await db.query(sql, [userId, recipeId]);
        return results.length > 0;
    }

    static async countLikes(recipeId) {
        const sql = `
            SELECT COUNT(*) AS likeCount
            FROM likes
            WHERE recipe_id = ?
        `;
        const results = await db.query(sql, [recipeId]);
        return results[0].likeCount;
    }
}

module.exports = { Like };
