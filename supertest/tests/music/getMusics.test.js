const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, getCreatedUserId, createMusicEntries, deleteMusicEntries, getCreatedMusicIds } = require('../hooks/music/musicHooks');

describe('Music API Test - GET Requests', () => {

    before(async () => {
        await createTestUser();
        await createMusicEntries(5);
    });

    after(async () => {
        await deleteMusicEntries();
        await deleteTestUser();
    });

    it('TC-36: Verify Successful Retrieval of Music List with /music endpoint', async () => {
        const response = await request.get('/music')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
    });

    it('TC-37: Verify Response Contains All Expected Fields for Each Music Entry', async () => {
        const response = await request.get('/music')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
        response.body.forEach(music => {
            expect(music).to.have.property('id');
            expect(music).to.have.property('title');
            expect(music).to.have.property('description');
            expect(music).to.have.property('youtubeLink');
            expect(music).to.have.property('isPublished');
            expect(music).to.have.property('publicationDate');
            expect(music).to.have.property('userId');
        });
    });

    it('TC-38: Verify Correct Handling of Empty Music List with get /music endpoint', async () => {
        await deleteMusicEntries();

        const response = await request.get('/music')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.empty;
    });


    it('TC-41: Verify System Response When Invalid Music ID Format is Submitted for get /music/{id} endpoint', async () => {
        const response = await request.get('/music/a')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-42: Verify System Response When Music ID Does Not Exist in Database for get /music/{id} endpoint', async () => {
        const nonExistentMusicId = -1;
        const response = await request.get(`/music/${nonExistentMusicId}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Music ID does not exist.');
    });
});
