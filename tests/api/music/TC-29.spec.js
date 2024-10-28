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

    it('TC-29: Verify Response When Title Field is Missing in the Music Entry Request [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: A music entry missing the title field
        const music = {
            description: 'This is the liebestraum No. 3',
            youTubeLink: 'http://youtube.com?v=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            userId: getCreatedUserId()
        };

        // When: Sending a POST request without the title field
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');

        // Then: Expect a failure response with status 400 due to the missing title field
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });
});
