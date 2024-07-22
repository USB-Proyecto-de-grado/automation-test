const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createMiscPublicationEntries, deleteMiscPublicationEntries, getCreatedMiscPublicationIds } = require('../hooks/miscPublicationController/miscPublicationHooks');

describe('Miscellaneous Publication API Test - DELETE Requests', () => {

    before(async () => {
        await createTestUser();
        await createMiscPublicationEntries(5);
    });

    after(async () => {
        await deleteMiscPublicationEntries();
        await deleteTestUser();
    });

    it('TC-61: Verify Successful Deletion of Miscellaneous Publication Entry When Valid ID is Provided', async () => {
        const miscPublicationIds = getCreatedMiscPublicationIds();
        const response = await request.delete(`/miscPublication/${miscPublicationIds[0]}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message', 'Publication deleted successfully.');
    });

    it('TC-62: Verify Response When Invalid Miscellaneous Publication ID Format is Submitted for Deletion', async () => {
        const invalidId = 'invalid-id';
        const response = await request.delete(`/miscPublication/${invalidId}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-63: Verify System Response When Deleting Miscellaneous Publication ID That Does Not Exist in Database', async () => {
        const nonExistentId = 999999;
        const response = await request.delete(`/miscPublication/${nonExistentId}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error');
    });

    it('TC-64: Verify Response for Unauthorized Access Attempt to Delete Miscellaneous Publication Entry', async () => {
        const miscPublicationIds = getCreatedMiscPublicationIds();
        const response = await request.delete(`/miscPublication/${miscPublicationIds[0]}`)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('error');
    });

    it('TC-65: Verify Response When Additional Unrecognized Parameters are Included in the Delete Request', async () => {
        const miscPublicationIds = getCreatedMiscPublicationIds();
        const response = await request.delete(`/miscPublication/${miscPublicationIds[0]}?extraParam=true`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-66: Verify Response When Attempting to Delete Miscellaneous Publication Entry with Insufficient Permissions', async () => {
        const miscPublicationIds = getCreatedMiscPublicationIds();
        const response = await request.delete(`/miscPublication/${miscPublicationIds[0]}`)
                                      .set('Accept', 'application/json')
                                      .set('Authorization', 'Bearer invalid-token');
        expect(response.status).to.equal(403);
        expect(response.body).to.have.property('error');
    });

    it('TC-67: Verify System Response When Request Contains Missing Required Field ID', async () => {
        const response = await request.delete('/miscPublication/')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });
});
