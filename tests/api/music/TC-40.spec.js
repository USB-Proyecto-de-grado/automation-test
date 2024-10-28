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

    it('TC-40: Verify Successful Deletion of Music Entry When Valid ID is Provided [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: A valid music ID from the created music entries
        const createdMusicIds = getCreatedMusicIds();
        const validMusicId = createdMusicIds[0];
        
        // When: Sending a DELETE request for a music entry by valid ID
        const response = await request.delete(`/music/${validMusicId}`)
                                      .set('Accept', 'application/json');

        // Then: Expect the response to confirm successful deletion
        expect(response.status).to.equal(200);
    });
});
