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

    it('TC-36: Verify Successful Retrieval of Music List with /music endpoint [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // When: Sending a GET request to retrieve the music list
        const response = await request.get('/music')
                                      .set('Accept', 'application/json');

        // Then: Expect the response to be successful and the list to be not empty
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
    });
});
