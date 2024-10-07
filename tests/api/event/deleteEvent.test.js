const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createEventEntries, getCreatedUserId, createTestUbication, deleteTestUbication, deleteEventEntries, getCreatedUbicationId } = require('../hooks/event/eventHooks');

describe('Event API Test - DELETE Requests  [Tag: API Testing]', () => {

    before(async () => {
        await createTestUser();
        await createTestUbication();
        await createEventEntries(1);
    });

    after(async () => {
        await deleteEventEntries();
        await deleteTestUbication();
        await deleteTestUser();
    });

    it('TC-117: Verify successful deletion of event entry when valid ID is provided', async () => {
        const eventIds = getCreatedEventIds();
        const eventId = eventIds[0];
        console.log('Event ID for TC-117:', eventId);
        
        const deleteResponse = await request.delete(`/event/${eventId}`)
                                            .set('Accept', 'application/json');

        expect(deleteResponse.status).to.equal(200);
        expect(deleteResponse.body).to.have.property('message', 'Event successfully deleted.');

        const getResponse = await request.get(`/event/${eventId}`)
                                         .set('Accept', 'application/json');

        expect(getResponse.status).to.equal(404);
        expect(getResponse.body).to.have.property('error', 'Event ID does not exist.');
    });

    // it('TC-119: Verify system response when deleting event ID that does not exist in the database', async () => {
    //     const nonExistentEventId = 999999;
        
    //     const response = await request.delete(`/event/${nonExistentEventId}`)
    //                                   .set('Accept', 'application/json')
    //                                   .expect('Content-Type', /json/);

    //     expect(response.status).to.equal(404);
    //     expect(response.body).to.have.property('error', 'Event ID does not exist.');
    // });
});
