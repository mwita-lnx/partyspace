/**
 * Game API Helper
 * Provides unified interface for games to submit scores and data
 */

class GameAPI {
  constructor(roomId, participantId, awardId, gameType) {
    this.roomId = roomId;
    this.participantId = participantId;
    this.awardId = awardId;
    this.gameType = gameType;
    this.baseUrl = '';
  }

  /**
   * Submit score with optional detailed metrics
   * @param {Object} data - Score data
   * @param {number} data.score - Primary score for leaderboard
   * @param {Object} data.metrics - Game-specific metrics (optional)
   * @param {number} data.timeSpent - Time spent in seconds (optional)
   * @param {boolean} data.isCorrect - For quiz games (optional)
   * @returns {Promise<Object>} Response data
   */
  async submitScore(data) {
    try {
      const response = await fetch(`${this.baseUrl}/api/rooms/${this.roomId}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: this.participantId,
          awardId: this.awardId,
          gameType: this.gameType,
          score: data.score,
          metrics: data.metrics || {},
          timeSpent: data.timeSpent || 0,
          isCorrect: data.isCorrect
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  }

  /**
   * Submit vote (for voting-based games)
   * @param {Object} data - Vote data
   * @param {string} data.nominee - Who was voted for
   * @param {string} data.answer - Answer text (optional)
   * @param {number} data.timeSpent - Time spent (optional)
   * @param {boolean} data.isCorrect - For quiz games (optional)
   * @returns {Promise<Object>} Response data
   */
  async submitVote(data) {
    try {
      const response = await fetch(`${this.baseUrl}/api/rooms/${this.roomId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: this.participantId,
          awardId: this.awardId,
          nominee: data.nominee,
          answer: data.answer || data.nominee,
          timeSpent: data.timeSpent || 0,
          isCorrect: data.isCorrect
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  }

  /**
   * Notify parent window that game is complete
   * @param {Object} data - Additional data to send
   */
  notifyComplete(data = {}) {
    window.parent.postMessage({
      type: 'GAME_COMPLETE',
      ...data
    }, '*');
  }

  /**
   * Complete workflow: submit score and notify parent
   * @param {Object} scoreData - Score data to submit
   * @param {number} delay - Delay before notifying parent (ms)
   * @returns {Promise<void>}
   */
  async completeGame(scoreData, delay = 2000) {
    try {
      await this.submitScore(scoreData);
      console.log('Score saved successfully');

      // Wait for specified delay to show results
      setTimeout(() => {
        this.notifyComplete(scoreData);
      }, delay);
    } catch (error) {
      console.error('Error completing game:', error);
      // Still advance even on error
      setTimeout(() => {
        this.notifyComplete({ error: true, score: scoreData.score });
      }, delay);
    }
  }
}

// Make it available globally
window.GameAPI = GameAPI;
