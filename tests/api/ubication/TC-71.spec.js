const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createUbications, deleteUbications, getCreatedUbicationIds } = require('../../hooks/ubication/ubicationHooks');

describe('Ubication API Test - POST Requests [Tag: API Testing]', () => {

    before(async () => {
        await createUbications(3);
    });

    after(async () => {
        await deleteUbications();
    });

    it('TC-71: Verify Response When UbicationName Field Exceeds Maximum Length in the Ubication Request [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: An ubication with a ubicationName field that exceeds maximum length
        const ubication = { ubicationName: 'A'.repeat(256) };  // Assuming 256 characters exceed the max length

        // When: Sending a POST request with an excessively long ubicationName
        const response = await request.post('/ubication')
                                      .send(ubication)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        // Then: Expect a failure response with status 500 due to the excessive length
        expect(response.status).to.equal(500);
    });
});
