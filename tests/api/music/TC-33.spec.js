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

    it('TC-33: Verify Response When Publication Date Field is in an Incorrect Format [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: A music entry with a publication date in an incorrect format
        const music = {
            title: 'Liebestraum No. 3',
            description: 'This is the liebestraum No. 3',
            youTubeLink: 'http://youtube.com?v=1232332',
            isPublished: true,
            publicationDate: '12-03-2020',  // Incorrect format
            userId: getCreatedUserId()
        };

        // When: Sending a POST request with an incorrectly formatted publication date
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');

        // Then: Expect a failure response with status 400 due to the incorrect publication date format
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });
});
