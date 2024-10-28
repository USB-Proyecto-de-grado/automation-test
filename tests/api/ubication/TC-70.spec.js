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

    it('TC-70: Verify Response When UbicationName Field is Empty in the Ubication Request [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: An ubication with an empty ubicationName field
        const ubication = { ubicationName: '' };

        // When: Sending a POST request with an empty ubicationName field
        const response = await request.post('/ubication')
                                      .send(ubication)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        // Then: Expect a failure response with status 400 due to the empty field
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });
});
