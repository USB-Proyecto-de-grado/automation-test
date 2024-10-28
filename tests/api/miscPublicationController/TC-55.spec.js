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

    it('TC-55: Verify Correct Data Storage for Created Miscellaneous Publication With Special Characters [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: A miscellaneous publication with special characters in title and description
        const miscPublication = {
            title: 'Título con caracteres especiales: !@#$%^&*()_+',
            description: 'Descripción con caracteres especiales: !@#$%^&*()_+',
            fileUrl: 'http://file.url/special-chars',
            isPublished: true,
            publicationDate: '2020-12-05',
            userId: getCreatedUserId()
        };

        // When: Sending a POST request to create a miscellaneous publication with special characters
        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json');

        // Then: Expect the creation to be successful with status 201 and special characters correctly stored
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
