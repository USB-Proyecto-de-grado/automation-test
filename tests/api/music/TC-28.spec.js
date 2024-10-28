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

    it('TC-28: Verify Successful Creation of Music Entry with All Required Fields Provided [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: A music entry with all required fields filled
        const music = {
            title: 'Liebestraum No. 3',
            description: 'This is the liebestraum No. 3',
            youTubeLink: 'http://youtube.com?v=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            userId: getCreatedUserId()
        };

        // When: Sending a POST request to create a music entry
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');

        // Then: Expect the creation to be successful with status 201 and all provided fields to be correctly saved
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('title', music.title);
        expect(response.body).to.have.property('description', music.description);
        expect(response.body).to.have.property('youTubeLink', music.youTubeLink);
        expect(response.body).to.have.property('isPublished', music.isPublished);
        expect(response.body).to.have.property('publicationDate', music.publicationDate);
        expect(response.body.user).to.have.property('id', music.userId);
        addCreatedMusicId(response.body.id);
    });
});
