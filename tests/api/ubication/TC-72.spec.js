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

    it('TC-72: Verify Response When Duplicate Ubication Entry is Submitted [Tag: API Testing] [Tag: Negative Testing] [Tag: Bug]', async () => {
        // Given: An ubication that is a duplicate of an existing entry
        const ubication = { ubicationName: 'Aula Magna de Humanidades' };

        // When: Sending a POST request to create a duplicate ubication
        const response = await request.post('/ubication')
                                      .send(ubication)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        // Then: Expect a failure response with status 409 due to the duplicate entry
        expect(response.status).to.equal(409);
        expect(response.body).to.have.property('error');
    });
});
