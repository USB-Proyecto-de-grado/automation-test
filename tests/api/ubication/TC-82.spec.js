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

    it('TC-82: Verify Successful Retrieval of Ubication Entry When Valid ID is Provided [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: A valid ubication ID from the created ubications
        const ubicationId = getCreatedUbicationIds()[0];

        // When: Sending a GET request to retrieve ubication details by valid ID
        const response = await request.get(`/ubication/${ubicationId}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);

        // Then: Expect the response to be successful and correctly display the ubication details
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', ubicationId);
        expect(response.body).to.have.property('ubicationName');
    });
});
