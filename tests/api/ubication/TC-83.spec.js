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

    it('TC-83: Verify Response When Invalid Ubication ID Format is Submitted [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: An invalid ubication ID format
        const invalidUbicationId = 'a';

        // When: Sending a GET request with an invalid ubication ID
        const response = await request.get(`/ubication/${invalidUbicationId}`)
                                      .set('Accept', 'application/json');

        // Then: Expect the server to return an error response due to invalid ID format
        expect(response.status).to.equal(500); 
        expect(response.body).to.have.property('message', 'Internal server error');
    });
});
