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

    it('TC-54: Verify System Behavior and Response When Duplicate Miscellaneous Publication Entry is Submitted [Tag: API Testing] [Tag: Negative Testing] [Tag: Bug]', async () => {
        // Given: A duplicate miscellaneous publication is about to be submitted
        const miscPublication = {
            title: 'Duplicate Misc Publication',
            description: 'Description for the duplicate misc publication',
            fileUrl: 'http://file.url/duplicate',
            isPublished: true,
            publicationDate: '2020-12-05',
            userId: getCreatedUserId()
        };
        // Submitting the first entry to create a duplicate scenario
        const first = await request.post('/miscPublication')
                                   .send(miscPublication)
                                   .set('Accept', 'application/json')
                                   .expect(201);
        addCreatedMiscPublicationId(first.body.id);

        // When: Sending another POST request to create a duplicate entry
        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json');

        // Then: Expect a failure response with status 409 due to the duplicate entry
        addCreatedMiscPublicationId(response.body.id);
        expect(response.status).to.equal(409);
        expect(response.body).to.have.property('error');
    });
});
