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

    it('TC-68: Verify Successful Creation of Ubication Entry with All Required Fields Provided [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: An ubication with all required fields filled
        const ubication = { ubicationName: 'Nueva Aula' };

        // When: Sending a POST request to create an ubication
        const response = await request.post('/ubication')
                                      .send(ubication)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json')
                                      .expect('Content-Type', /json/);

        // Then: Expect the creation to be successful with status 201 and all provided fields to be correctly saved
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('ubicationName', ubication.ubicationName);
        getCreatedUbicationIds().push(response.body.id);
    });
});
