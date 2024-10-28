const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, getCreatedUserId, createMusicEntries, deleteMusicEntries, getCreatedMusicIds } = require('../../hooks/music/musicHooks');

describe('Music API Test - GET Requests by ID [Tag: API Testing]', () => {

    before(async () => {
        await createTestUser();
        await createMusicEntries(2);
    });

    after(async () => {
        await deleteMusicEntries();
        await deleteTestUser();
    });

    it('TC-125: Verify Response When Valid Music ID Format is Provided for get /music/{id} endpoint [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: A valid music ID from the created music entries
        const createdMusicIds = getCreatedMusicIds();
        const validMusicId = createdMusicIds[0];

        // When: Sending a GET request to retrieve music details by valid ID
        const response = await request.get(`/music/${validMusicId}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);

        // Then: Expect the response to be successful and to correctly display the music details
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', validMusicId);
        expect(response.body).to.have.property('title');
        expect(response.body).to.have.property('description');
        expect(response.body).to.have.property('youTubeLink');
        expect(response.body).to.have.property('isPublished');
        expect(response.body).to.have.property('publicationDate');
    });
});
