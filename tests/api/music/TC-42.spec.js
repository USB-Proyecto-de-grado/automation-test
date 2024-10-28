const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, getCreatedUserId, createMusicEntries, deleteMusicEntries, getCreatedMusicIds } = require('../../hooks/music/musicHooks');

describe('Music API Test - GET Requests [Tag: API Testing]', () => {

    before(async () => {
        await createTestUser();
        await createMusicEntries(5);
    });

    after(async () => {
        await deleteMusicEntries();
        await deleteTestUser();
    });

    it('TC-42: Verify System Response When Music ID Does Not Exist in Database for get /music/{id} endpoint [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: A non-existent music ID (-1, assuming -1 is not used)
        const nonExistentMusicId = -1;

        // When: Sending a GET request for a music entry that does not exist
        const response = await request.get(`/music/${nonExistentMusicId}`)
                                      .set('Accept', 'application/json');

        // Then: Expect the response to indicate the music ID does not exist with status 404
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Not Found');
        expect(response.body).to.have.property('message', 'Item with id -1 not found');
    });
});
