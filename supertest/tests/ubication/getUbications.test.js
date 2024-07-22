const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createUbications, deleteUbications, getCreatedUbicationIds } = require('../hooks/ubication/ubicationHooks');

describe('Ubication API Test - GET Requests (Retrieve List)', () => {

    before(async () => {
        await createUbications(5);
    });

    after(async () => {
        await deleteUbications();
    });

    it('TC-76: Verify Response Contains All Expected Fields for Each Ubication Entry', async () => {
        const response = await request.get('/ubication')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
        response.body.forEach(ubication => {
            expect(ubication).to.have.property('id');
            expect(ubication).to.have.property('ubicationName');
        });
    });

    it('TC-77: Verify Successful Retrieval of Ubication List with /ubication endpoint', async () => {
        const response = await request.get('/ubication')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;
        response.body.forEach(ubication => {
            expect(ubication).to.have.property('id');
            expect(ubication).to.have.property('ubicationName');
        });
    });

    it('TC-78: Verify Correct Handling of Empty Ubication List for /ubication endpoint', async () => {
        await deleteUbications();

        const response = await request.get('/ubication')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.empty;
    });

    it('TC-79: Verify Response Time for Ubication List Retrieval is Within Acceptable Limits', async () => {
        const startTime = new Date().getTime();
        const response = await request.get('/ubication')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        const endTime = new Date().getTime();
        const responseTime = endTime - startTime;

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(responseTime).to.be.below(1000);
    });

    it('TC-81: Verify System Returns Ubication List Sorted by Name in Ascending Order', async () => {
        const response = await request.get('/ubication?sort=name_asc')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array').that.is.not.empty;

        const ubicationNames = response.body.map(ubication => ubication.ubicationName);
        const sortedUbicationNames = [...ubicationNames].sort();
        expect(ubicationNames).to.deep.equal(sortedUbicationNames);
    });
});
