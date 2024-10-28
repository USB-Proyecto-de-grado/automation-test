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

    it('TC-58: Verify Correct Handling of Empty Miscellaneous Publications List with GET endpoint [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // When: Deleting all entries then sending a GET request to retrieve the list
        await deleteMiscPublicationEntries();
        const response = await request.get('/miscPublication')
                                      .set('Accept', 'application/json');

        // Then: Expect the response to be successful but the list to be empty
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.empty;
        await createMiscPublicationEntries(5); // Optionally recreating entries for subsequent tests
    });

});
