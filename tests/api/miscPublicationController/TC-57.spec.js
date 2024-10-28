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

    it('TC-57: Verify Response Contains All Expected Fields for Each Miscellaneous Publication Entry with GET endpoint [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // When: Sending a GET request to retrieve the list of miscellaneous publications
        const response = await request.get('/miscPublication')
                                      .set('Accept', 'application/json');

        // Then: Expect the response to be successful and each entry to contain all expected fields
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
        response.body.forEach(entry => {
            expect(entry).to.have.property('id');
            expect(entry).to.have.property('title');
            expect(entry).to.have.property('description');
            expect(entry).to.have.property('fileUrl');
            expect(entry).to.have.property('isPublished');
            expect(entry).to.have.property('publicationDate');
        });
    });
});
