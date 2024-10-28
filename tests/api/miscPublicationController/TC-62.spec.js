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

    it('TC-62: Verify Response When Invalid Miscellaneous Publication ID Format is Submitted for Deletion [Tag: API Testing] [Tag: Negative Testing] [Tag: Bug]', async () => {
        // Given: An invalid ID format for a miscellaneous publication
        const invalidId = -1; // Typically, negative IDs are invalid in databases

        // When: Sending a DELETE request with an invalid ID
        const response = await request.delete(`/miscPublication/${invalidId}`)
                                      .set('Accept', 'application/json');

        // Then: Expect the response to indicate an error due to the invalid ID format
        expect(response.status).to.equal(400); // The status should be 400 indicating a client-side error
        expect(response.body).to.have.property('error'); // The body should contain an error message explaining the invalid ID
    });
});
