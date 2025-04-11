// models/comment.js
const db = require('./../services/db');

class Comment {
  // Add a comment to the database
  static async addComment(userId, recipeId, content) {
    const sql = `
      INSERT INTO comment (user_id, recipe_id, content)
      VALUES (?, ?, ?)
    `;
    return await db.query(sql, [userId, recipeId, content]);
  }

  // Fetch all comments for a given recipe (including user first names)
  static async getCommentsByRecipe(recipeId) {
    const sql = `
      SELECT comment.*, user.firstName AS user_firstname
      FROM comment
      JOIN user ON comment.user_id = user.user_id
      WHERE comment.recipe_id = ?
      ORDER BY comment_id DESC
    `;
    const results = await db.query(sql, [recipeId]);
    return results;
}

// Delete a comment by its ID
static async deleteComment(commentId) {
    const sql = `
      DELETE FROM comment
      WHERE comment_id = ?
    `;
    return await db.query(sql, [commentId]);
}


}

module.exports = { Comment };
