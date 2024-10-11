const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createMiscPublicationEntries, deleteMiscPublicationEntries, getCreatedMiscPublicationIds, getCreatedUserId } = require('../../hooks/miscPublicationController/miscPublicationHooks');

describe('Miscellaneous Publication API Test - DELETE Requests [Tag: API Testing]', () => {

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
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(200);
    });

    it('TC-62: Verify Response When Invalid Miscellaneous Publication ID Format is Submitted for Deletion [Tag: Bug]', async () => {
        const invalidId = -1;
        const response = await request.delete(`/miscPublication/${invalidId}`)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

});
