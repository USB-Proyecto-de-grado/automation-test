const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createUbications, deleteUbications, getCreatedUbicationIds } = require('../hooks/ubication/ubicationHooks');

describe('Ubication API Test - POST Requests', () => {

    before(async () => {
        await createUbications(3);
    });

    after(async () => {
        await deleteUbications();
    });

    it('TC-68: Verify Successful Creation of Ubication Entry with All Required Fields Provided', async () => {
        const ubication = { ubicationName: 'Nueva Aula' };
        const response = await request.post('/ubication')
                                      .send(ubication)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('ubicationName', ubication.ubicationName);
        getCreatedUbicationIds().push(response.body.id);
    });

    it('TC-69: Verify Response When UbicationName Field is Missing in the Ubication Request', async () => {
        const ubication = {};
        const response = await request.post('/ubication')
                                      .send(ubication)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-70: Verify Response When UbicationName Field is Empty in the Ubication Request', async () => {
        const ubication = { ubicationName: '' };
        const response = await request.post('/ubication')
                                      .send(ubication)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-71: Verify Response When UbicationName Field Exceeds Maximum Length in the Ubication Request', async () => {
        const ubication = { ubicationName: 'A'.repeat(256) };
        const response = await request.post('/ubication')
                                      .send(ubication)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-72: Verify Response When Duplicate Ubication Entry is Submitted', async () => {
        const ubication = { ubicationName: 'Aula Magna de Humanidades' };
        const response = await request.post('/ubication')
                                      .send(ubication)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');
        expect(response.status).to.equal(409);
        expect(response.body).to.have.property('error');
    });

    it('TC-73: Verify Response When Additional Unrecognized Fields are Included in the Ubication Request', async () => {
        const ubication = {
            ubicationName: 'Aula Adicional',
            additionalField1: 'Unrecognized Field 1',
            additionalField2: 'Unrecognized Field 2'
        };
        const response = await request.post('/ubication')
                                      .send(ubication)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('ubicationName', ubication.ubicationName);
        expect(response.body).to.not.have.property('additionalField1');
        expect(response.body).to.not.have.property('additionalField2');
        getCreatedUbicationIds().push(response.body.id);
    });
});
