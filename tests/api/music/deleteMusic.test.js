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

    it('TC-40: Verify Successful Deletion of Music Entry When Valid ID is Provided', async () => {
        const createdMusicIds = getCreatedMusicIds();
        const validMusicId = createdMusicIds[0];
        
        const response = await request.delete(`/music/${validMusicId}`)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(200);
    });

    it('TC-124: Verify Response When Invalid Music ID Format is Submitted for Deletion [Tag: Bug]', async () => {
        const response = await request.delete('/music/-1')
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-123: Verify System Response When Deleting Music ID That Does Not Exist in Database [Tag: Bug]', async () => {
        const nonExistentMusicId = 0;
        const response = await request.delete(`/music/${nonExistentMusicId}`)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Music ID does not exist.');
    });

    it('TC-44: Verify Correct Handling of Concurrent Delete Requests for the Same Music ID', async () => {
        const createdMusicIds = getCreatedMusicIds();
        const validMusicId = createdMusicIds[0];
    
        const deleteRequest = () => request.delete(`/music/${validMusicId}`)
                                           .set('Accept', 'application/json');
    
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
