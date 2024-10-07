const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createMiscPublicationEntries, deleteMiscPublicationEntries, getCreatedMiscPublicationIds, getCreatedUserId } = require('../hooks/miscPublicationController/miscPublicationHooks');

describe('Miscellaneous Publication API Test - GET Requests (List Retrieve) [Tag: API Testing]', () => {

    before(async () => {
        await createTestUser();
        await createMiscPublicationEntries(5);
    });

    after(async () => {
        await deleteMiscPublicationEntries();
        await deleteTestUser();
    });

    it('TC-56: Verify Successful Retrieval of Miscellaneous Publications List with GET endpoint', async () => {
        const response = await request.get('/miscPublication')
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
    });

    it('TC-57: Verify Response Contains All Expected Fields for Each Miscellaneous Publication Entry with GET endpoint', async () => {
        const response = await request.get('/miscPublication')
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
        response.body.forEach(entry => {
            expect(entry).to.have.property('id');
            expect(entry).to.have.property('title');
            expect(entry).to.have.property('description');
            expect(entry).to.have.property('fileUrl');
            expect(entry).to.have.property('isPublished');
            expect(entry).to.have.property('publicationDate');
            expect(entry).to.have.property('userId');
        });
    });

    it('TC-58: Verify Correct Handling of Empty Miscellaneous Publications List with GET endpoint', async () => {
        await deleteMiscPublicationEntries();
        const response = await request.get('/miscPublication')
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.empty;
        await createMiscPublicationEntries(5);
    });

    it('TC-59: Verify Response When Invalid Query Parameters are Provided with GET endpoint', async () => {
        const response = await request.get('/miscPublication?invalidParam=true')
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });
});
