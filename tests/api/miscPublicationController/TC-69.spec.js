const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createMiscPublicationEntries, deleteMiscPublicationEntries, getCreatedMiscPublicationIds, getCreatedUserId } = require('../../hooks/miscPublicationController/miscPublicationHooks');

describe('Miscellaneous Publication API Test - GET Requests (By ID)', () => {

    before(async () => {
        await createTestUser();
        await createMiscPublicationEntries(5);
    });

    after(async () => {
        await deleteMiscPublicationEntries();
        await deleteTestUser();
    });

    it('TC-69: Verify Response When Invalid Miscellaneous Publication ID Format is Submitted [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: An invalid ID format for a miscellaneous publication
        const invalidId = -1; // Typically, negative IDs are invalid in databases

        // When: Sending a GET request with an invalid ID
        const response = await request.get(`/miscPublication/${invalidId}`)
                                      .set('Accept', 'application/json');

        // Then: Expect the response to indicate an error due to the invalid ID format
        expect(response.status).to.equal(404); // The status should be 404 indicating not found
        expect(response.body).to.have.property('error', 'Not Found');
        expect(response.body).to.have.property('message', 'Item with id -1 not found');
    });
});
