const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createUbications, deleteUbications, getCreatedUbicationIds } = require('../hooks/ubication/ubicationHooks');

describe('Ubication API Test - GET Requests (By ID)', () => {

    before(async () => {
        await createUbications(5);
    });

    after(async () => {
        await deleteUbications();
    });

    it('TC-82: Verify Successful Retrieval of Ubication Entry When Valid ID is Provided', async () => {
        const ubicationId = getCreatedUbicationIds()[0];
        const response = await request.get(`/ubication/${ubicationId}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', ubicationId);
        expect(response.body).to.have.property('ubicationName');
    });

    it('TC-83: Verify Response When Invalid Ubication ID Format is Submitted', async () => {
        const invalidUbicationId = 'invalid';
        const response = await request.get(`/ubication/${invalidUbicationId}`)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error', 'Invalid ID format.');
    });

    it('TC-84: Verify System Response When Ubication ID Does Not Exist in Database', async () => {
        const nonExistentUbicationId = 10000000000;
        const response = await request.get(`/ubication/${nonExistentUbicationId}`)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Ubication ID does not exist.');
    });
});
