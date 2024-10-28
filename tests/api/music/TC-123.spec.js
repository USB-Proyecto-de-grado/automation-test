const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, getCreatedUserId, createMusicEntries, deleteMusicEntries, getCreatedMusicIds } = require('../../hooks/music/musicHooks');

describe('Music API Test - DELETE Requests [Tag: API Testing]', () => {

    before(async () => {
        await createTestUser();
        await createMusicEntries(5);
    });

    after(async () => {
        await deleteMusicEntries()
        await deleteTestUser();
    });

    it('TC-123: Verify System Response When Deleting Music ID That Does Not Exist in Database [Tag: API Testing] [Tag: Negative Testing] [Tag: Bug]', async () => {
        // Given: A non-existent music ID (0, assuming 0 is not used)
        const nonExistentMusicId = 0;
        
        // When: Sending a DELETE request for a music entry that does not exist
        const response = await request.delete(`/music/${nonExistentMusicId}`)
                                      .set('Accept', 'application/json');

        // Then: Expect the response to indicate the music ID does not exist with status 404
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Music ID does not exist.');
    });
});
