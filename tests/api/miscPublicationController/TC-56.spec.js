const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createMiscPublicationEntries, deleteMiscPublicationEntries, getCreatedMiscPublicationIds, getCreatedUserId } = require('../../hooks/miscPublicationController/miscPublicationHooks');

describe('Miscellaneous Publication API Test - GET Requests (List Retrieve) [Tag: API Testing]', () => {

    before(async () => {
        await createTestUser();
        await createMiscPublicationEntries(5);
    });

    after(async () => {
        await deleteMiscPublicationEntries();
        await deleteTestUser();
    });

    it('TC-56: Verify Successful Retrieval of Miscellaneous Publications List with GET endpoint [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: Miscellaneous publications have been created and are ready to be retrieved
        // When: Sending a GET request to retrieve the list of miscellaneous publications
        const response = await request.get('/miscPublication')
                                      .set('Accept', 'application/json');

        // Then: Expect the response to be successful and to contain a list of publications
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
    });

});
