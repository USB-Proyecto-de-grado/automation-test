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

    it('TC-47: Verify Successful Creation of Miscellaneous Publication Entry with All Required Fields Provided [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: A miscellaneous publication with all required fields
        const miscPublication = {
            title: 'New Misc Publication',
            description: 'Description for the new misc publication',
            fileUrl: 'http://file.url/new',
            isPublished: true,
            publicationDate: '2020-12-05',
            userId: getCreatedUserId()
        };

        // When: Sending a POST request to create a miscellaneous publication
        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        // Then: Expect the creation to be successful with status 201 and proper data reflection
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('title', miscPublication.title);
        expect(response.body).to.have.property('description', miscPublication.description);
        expect(response.body).to.have.property('fileUrl', miscPublication.fileUrl);
        expect(response.body).to.have.property('isPublished', miscPublication.isPublished);
        expect(response.body).to.have.property('publicationDate', miscPublication.publicationDate);
        addCreatedMiscPublicationId(response.body.id);
    });
});
