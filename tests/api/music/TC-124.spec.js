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

    it('TC-44: Verify Correct Handling of Concurrent Delete Requests for the Same Music ID [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: A valid music ID from the created music entries
        const createdMusicIds = getCreatedMusicIds();
        const validMusicId = createdMusicIds[0];
    
        // When: Sending two concurrent DELETE requests for the same music ID
        const deleteRequest = () => request.delete(`/music/${validMusicId}`)
                                           .set('Accept', 'application/json');
    
        // Then: Expect one of the requests to succeed and the other to fail, or both to show it was already deleted
        await Promise.all([
            deleteRequest(),
            deleteRequest()
        ]).then(responses => {
            const [firstResponse, secondResponse] = responses;
            expect(firstResponse.status).to.be.oneOf([200, 404]);
            expect(secondResponse.status).to.be.oneOf([200, 404]);
        });
    });
});
