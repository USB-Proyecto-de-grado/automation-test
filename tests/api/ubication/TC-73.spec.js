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

    it('TC-73: Verify Response When Additional Unrecognized Fields are Included in the Ubication Request [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: An ubication with additional unrecognized fields
        const ubication = {
            ubicationName: 'Aula Adicional',
            additionalField1: 'Unrecognized Field 1',
            additionalField2: 'Unrecognized Field 2'
        };

        // When: Sending a POST request with additional fields
        const response = await request.post('/ubication')
                                      .send(ubication)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        // Then: Expect the creation to be successful but ignore unrecognized fields
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('ubicationName', ubication.ubicationName);
        expect(response.body).to.not.have.property('additionalField1');
        expect(response.body).to.not.have.property('additionalField2');
        getCreatedUbicationIds().push(response.body.id);
    });
});
