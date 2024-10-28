const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, addCreatedMiscPublicationId , deleteMiscPublicationEntries, getCreatedMiscPublicationIds, getCreatedUserId } = require('../../hooks/miscPublicationController/miscPublicationHooks');

describe('Miscellaneous Publication API Test - POST Requests [Tag: API Testing]', () => {

    before(async () => {
        await createTestUser();
    });

    after(async () => {
        await deleteMiscPublicationEntries();
        await deleteTestUser();
    });

    it('TC-53: Verify Response When UserID Field is Missing in the Miscellaneous Publication Request [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: A miscellaneous publication missing the userID field
        const miscPublication = {
            title: 'New Misc Publication',
            description: 'Description for the new misc publication',
            fileUrl: 'http://file.url/new',
            isPublished: true,
            publicationDate: '2020-12-05'
        };

        // When: Sending a POST request missing the userID field
        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json');

        // Then: Expect a failure response with status 400 due to the missing userID field
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });
});
