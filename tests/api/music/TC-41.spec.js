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

    it('TC-41: Verify System Response When Invalid Music ID Format is Submitted for get /music/{id} endpoint [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // When: Sending a GET request with an invalid music ID format
        const response = await request.get('/music/a')
                                      .set('Accept', 'application/json');

        // Then: Expect a server error response due to invalid ID format
        expect(response.status).to.equal(500);
        expect(response.body).to.have.property('message', 'Internal server error');
    });
});
