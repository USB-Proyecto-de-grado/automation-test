const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, createTestUbication, createEventEntries, deleteEventEntries, deleteTestUserAndUbication, getCreatedEventIds, getCreatedUserId, getCreatedUbicationId } = require('../hooks/event/eventHooks');

describe('Event API Test - GET Requests (All Events)', () => {

    before(async () => {
        await createTestUser();
        await createTestUbication();
        await createEventEntries(1); // Crear al menos un evento
    });

    after(async () => {
        await deleteEventEntries();
        await deleteTestUserAndUbication();
    });

    it('TC-107: Verify successful retrieval of event list', async () => {
        const response = await request.get('/events')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.greaterThan(0);
    });
});
