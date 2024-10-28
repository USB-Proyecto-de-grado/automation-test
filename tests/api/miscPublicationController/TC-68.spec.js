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

    it('TC-68: Verify Successful Retrieval of Miscellaneous Publication Entry When Valid ID is Provided [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: A valid ID from the created miscellaneous publications
        const miscPublicationIds = getCreatedMiscPublicationIds();

        // When: Sending a GET request for a miscellaneous publication by valid ID
        const response = await request.get(`/miscPublication/${miscPublicationIds[0]}`)
                                      .set('Accept', 'application/json');

        // Then: Expect the response to confirm successful retrieval and correct ID
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', miscPublicationIds[0]);
    });
});
