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

    it('TC-37: Verify Response Contains All Expected Fields for Each Music Entry', async () => {
        // When: Sending a GET request to retrieve the music list
        const response = await request.get('/music')
                                      .set('Accept', 'application/json');

        // Then: Expect the response to be successful and each music entry to contain all expected fields
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
        response.body.forEach(music => {
            expect(music).to.have.property('id');
            expect(music).to.have.property('title');
            expect(music).to.have.property('description');
            expect(music).to.have.property('youTubeLink');
            expect(music).to.have.property('isPublished');
            expect(music).to.have.property('publicationDate');
        });
    });
});
