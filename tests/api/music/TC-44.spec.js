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

    it('TC-124: Verify Response When Invalid Music ID Format is Submitted for Deletion [Tag: API Testing] [Tag: Negative Testing] [Tag: Bug]', async () => {
        // Given: An invalid music ID is provided
        // When: Sending a DELETE request with an invalid music ID format (-1)
        const response = await request.delete('/music/-1')
                                      .set('Accept', 'application/json');

        // Then: Expect the response to indicate an error with status 400
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

});
