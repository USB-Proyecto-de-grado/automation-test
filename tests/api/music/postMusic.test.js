const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, getCreatedUserId, createMusicEntries, deleteMusicEntries, getCreatedMusicIds } = require('../hooks/music/musicHooks');

describe('Music API Test - POST Requests [Tag: API Testing]', () => {

    before(async () => {
        await createTestUser();
    });

    after(async () => {
        await deleteMusicEntries();
        await deleteTestUser();
    });

    it('TC-28: Verify Successful Creation of Music Entry with All Required Fields Provided', async () => {
        const music = {
            title: 'Liebestraum No. 3',
            description: 'This is the liebestraum No. 3',
            youTubeLink: 'http://youtube.com?v=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            userId: getCreatedUserId()
        };
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('title', music.title);
        expect(response.body).to.have.property('description', music.description);
        expect(response.body).to.have.property('youTubeLink', music.youTubeLink);
        expect(response.body).to.have.property('isPublished', music.isPublished);
        expect(response.body).to.have.property('publicationDate', music.publicationDate);
        expect(response.body).to.have.property('userId', music.userId);
        getCreatedMusicIds().push(response.body.id);
    });

    it('TC-29: Verify Response When Title Field is Missing in the Music Entry Request', async () => {
        const music = {
            description: 'This is the liebestraum No. 3',
            youTubeLink: 'http://youtube.com?v=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            userId: getCreatedUserId()
        };
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-30: Verify Response When Description Field is Missing in the Music Entry Request', async () => {
        const music = {
            title: 'Liebestraum No. 3',
            youTubeLink: 'http://youtube.com?v=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            userId: getCreatedUserId()
        };
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-31: Verify Response When URL Field is Invalid in the Music Entry Request', async () => {
        const music = {
            title: 'Liebestraum No. 3',
            description: 'This is the liebestraum No. 3',
            youTubeLink: 'invalid-url',
            isPublished: true,
            publicationDate: '2020-12-03',
            userId: getCreatedUserId()
        };
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-32: Verify Response When Publisher Field is Missing in the Music Entry Request', async () => {
        const music = {
            title: 'Liebestraum No. 3',
            description: 'This is the liebestraum No. 3',
            youTubeLink: 'http://youtube.com?v=1232332',
            isPublished: true,
            publicationDate: '2020-12-03'
        };
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-33: Verify Response When Publication Date Field is in an Incorrect Format', async () => {
        const music = {
            title: 'Liebestraum No. 3',
            description: 'This is the liebestraum No. 3',
            youTubeLink: 'http://youtube.com?v=1232332',
            isPublished: true,
            publicationDate: '12-03-2020',
            userId: getCreatedUserId()
        };
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-34: Verify System Behavior and Response When Duplicate Music Entry is Submitted', async () => {
        const music = {
            title: 'Liebestraum No. 3',
            description: 'This is the liebestraum No. 3',
            youTubeLink: 'http://youtube.com?v=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            userId: getCreatedUserId()
        };
        await request.post('/music')
                     .send(music)
                     .set('Accept', 'application/json')
                     .expect(201);
        
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(409);
        expect(response.body).to.have.property('error');
    });

    it('TC-35: Verify Response for Unauthorized Access Attempt to Create Music Entry', async () => {
        const music = {
            title: 'Liebestraum No. 3',
            description: 'This is the liebestraum No. 3',
            youTubeLink: 'http://youtube.com?v=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            userId: getCreatedUserId()
        };
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json')
                                      .set('Authorization', 'Bearer invalid_token');
        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('error', 'Unauthorized');
    });
});
