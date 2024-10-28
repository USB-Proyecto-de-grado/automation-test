const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createUbications, deleteUbications, getCreatedUbicationIds } = require('../../hooks/ubication/ubicationHooks');

describe('Ubication API Test - GET Requests (By ID) [Tag: API Testing]', () => {

    before(async () => {
        await createUbications(5);
    });

    after(async () => {
        await deleteUbications();
    });

    it('TC-84: Verify System Response When Ubication ID Does Not Exist in Database [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: A non-existent ubication ID
        const nonExistentUbicationId = 0;

        // When: Sending a GET request for a ubication entry that does not exist
        const response = await request.get(`/ubication/${nonExistentUbicationId}`)
                                      .set('Accept', 'application/json');

        // Then: Expect the response to indicate the ubication ID does not exist with status 404
        expect(response.status).to.equal(404); 
        expect(response.body).to.have.property('error', 'Not Found');
        expect(response.body).to.have.property('message', 'Item with id 0 not found');
    });
});
