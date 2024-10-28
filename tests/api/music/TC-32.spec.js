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

    it('TC-32: Verify Response When Publisher Field is Missing in the Music Entry Request [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: A music entry missing the publisher information
        const music = {
            title: 'Liebestraum No. 3',
            description: 'This is the liebestraum No. 3',
            youTubeLink: 'http://youtube.com?v=1232332',
            isPublished: true,
            publicationDate: '2020-12-03'  // Assuming 'userId' is considered as publisher and is missing here
        };

        // When: Sending a POST request missing the publisher (userId) field
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');

        // Then: Expect a failure response with status 400 due to the missing publisher field
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });
});
