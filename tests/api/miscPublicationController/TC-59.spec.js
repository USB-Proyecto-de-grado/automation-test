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

    it('TC-59: Verify Data Consistency Across Multiple Reads [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: Miscellaneous publications are available and unchanged between reads
        // When: Sending two consecutive GET requests to retrieve the list of miscellaneous publications
        const firstResponse = await request.get('/miscPublication')
                                           .set('Accept', 'application/json');
        const secondResponse = await request.get('/miscPublication')
                                            .set('Accept', 'application/json');

        // Then: Expect both responses to be identical, ensuring data consistency
        expect(firstResponse.body).to.deep.equal(secondResponse.body);
    });
});
