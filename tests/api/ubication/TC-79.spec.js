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

    it('TC-79: Verify Response Time for Ubication List Retrieval is Within Acceptable Limits [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: Start time before sending the GET request
        const startTime = new Date().getTime();

        // When: Sending a GET request to retrieve the list of ubications
        const response = await request.get('/ubication')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);

        // Then: Calculate the response time and expect it to be below a certain threshold
        const endTime = new Date().getTime();
        const responseTime = endTime - startTime;
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(responseTime).to.be.below(1000); // Response time should be under 1000 milliseconds
    });
});
