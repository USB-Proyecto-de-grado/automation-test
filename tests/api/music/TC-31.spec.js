const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, getCreatedUserId, createMusicEntries, deleteMusicEntries, getCreatedMusicIds, addCreatedMusicId } = require('../../hooks/music/musicHooks');

describe('Music API Test - POST Requests [Tag: API Testing]', () => {

    before(async () => {
        await createTestUser();
    });

    after(async () => {
        await deleteMusicEntries();
        await deleteTestUser();
    });

    it('TC-31: Verify Response When URL Field is Invalid in the Music Entry Request [Tag: API Testing] [Tag: Negative Testing] [Tag: Bug]', async () => {
        // Given: A music entry with an invalid URL
        const music = {
            title: 'Liebestraum No. 3',
            description: 'This is the liebestraum No. 3',
            youTubeLink: 'invalid-url',
            isPublished: true,
            publicationDate: '2020-12-03',
            userId: getCreatedUserId()
        };

        // When: Sending a POST request with an invalid URL
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');
        addCreatedMusicId(response.body.id);
        // Then: Expect a failure response with status 400 due to the invalid URL
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });
});
