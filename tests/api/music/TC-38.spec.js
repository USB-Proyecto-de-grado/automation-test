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

    it('TC-38: Verify Correct Handling of Empty Music List with get /music endpoint [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: Music entries are about to be deleted
        await deleteMusicEntries();

        // When: Sending a GET request to retrieve an empty list of music
        const response = await request.get('/music')
                                      .set('Accept', 'application/json');

        // Then: Expect the response to be successful but the list to be empty
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.empty;
    });

});
