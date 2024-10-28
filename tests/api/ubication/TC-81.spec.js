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

    it('TC-81: Verify System Returns Ubication List Sorted by Name in Ascending Order [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // When: Sending a GET request with a sorting parameter for ascending order by name
        const response = await request.get('/ubication?sort=name_asc')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);

        // Then: Expect the list to be sorted by name in ascending order
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
        const ubicationNames = response.body.map(ubication => ubication.ubicationName);
        const sortedUbicationNames = [...ubicationNames].sort();
        expect(ubicationNames).to.deep.equal(sortedUbicationNames);
    });

});
