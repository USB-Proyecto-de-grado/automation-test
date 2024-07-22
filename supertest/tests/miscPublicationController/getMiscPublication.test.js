const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createMiscPublicationEntries, deleteMiscPublicationEntries, getCreatedMiscPublicationIds } = require('../hooks/miscPublicationController/miscPublicationHooks');

describe('Miscellaneous Publication API Test - GET Requests (By ID)', () => {

    before(async () => {
        await createTestUser();
        await createMiscPublicationEntries(5);
    });

    after(async () => {
        await deleteMiscPublicationEntries();
        await deleteTestUser();
    });

    it('TC-68: Verify Successful Retrieval of Miscellaneous Publication Entry When Valid ID is Provided', async () => {
        const miscPublicationIds = getCreatedMiscPublicationIds();
        const response = await request.get(`/miscPublication/${miscPublicationIds[0]}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', miscPublicationIds[0]);
    });

    it('TC-69: Verify Response When Invalid Miscellaneous Publication ID Format is Submitted', async () => {
        const invalidId = 'invalid-id';
        const response = await request.get(`/miscPublication/${invalidId}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-70: Verify System Response When Miscellaneous Publication ID Does Not Exist in Database', async () => {
        const nonExistentId = 999999;
        const response = await request.get(`/miscPublication/${nonExistentId}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error');
    });

    it('TC-71: Verify Response Contains All Expected Fields for Miscellaneous Publication Entry with Valid ID', async () => {
        const miscPublicationIds = getCreatedMiscPublicationIds();
        const response = await request.get(`/miscPublication/${miscPublicationIds[0]}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', miscPublicationIds[0]);
        expect(response.body).to.have.property('title');
        expect(response.body).to.have.property('description');
        expect(response.body).to.have.property('fileURL');
        expect(response.body).to.have.property('isPublished');
        expect(response.body).to.have.property('publicationDate');
        expect(response.body).to.have.property('userId');
    });

    it('TC-72: Verify Response When ID Parameter is Missing in the Request', async () => {
        const response = await request.get('/miscPublication/')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });
});
