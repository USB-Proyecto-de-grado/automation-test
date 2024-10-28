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

    it('TC-34: Verify System Behavior and Response When Duplicate Music Entry is Submitted [Tag: API Testing] [Tag: Negative Testing] [Tag: Bug]', async () => {
        // Given: A duplicate music entry is about to be submitted
        const music = {
            title: 'Liebestraum No. 3',
            description: 'This is the liebestraum No. 3',
            youTubeLink: 'http://youtube.com?v=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            userId: getCreatedUserId()
        };

        // When: Submitting the first entry and then a duplicate entry
        const first = await request.post('/music')
                     .send(music)
                     .set('Accept', 'application/json')
                     .expect(201);
        
        addCreatedMusicId(first.body.id);
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');

        // Then: Expect a failure response with status 409 due to the duplicate entry
        addCreatedMusicId(response.body.id);
        expect(response.status).to.equal(409);
        expect(response.body).to.have.property('error');
    });
});
