const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createUbications, deleteUbications, getCreatedUbicationIds } = require('../../hooks/ubication/ubicationHooks');

describe('Ubication API Test - GET Requests (Retrieve List) [Tag: API Testing]', () => {

    before(async () => {
        await createUbications(5);
    });

    after(async () => {
        await deleteUbications();
    });

    it('TC-76: Verify Response Contains All Expected Fields for Each Ubication Entry [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // When: Sending a GET request to retrieve the list of ubications
        const response = await request.get('/ubication')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);

        // Then: Expect the response to be successful and each ubication to contain all expected fields
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
        response.body.forEach(ubication => {
            expect(ubication).to.have.property('id');
            expect(ubication).to.have.property('ubicationName');
        });
    });
});
