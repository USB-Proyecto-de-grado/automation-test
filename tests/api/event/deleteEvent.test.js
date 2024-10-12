const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createEventEntries, getCreatedUserId, createTestUbication, deleteTestUbication, deleteEventEntries, getCreatedEventIds } = require('../../hooks/event/eventHooks');

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

    it('TC-117: Verify successful deletion of event entry when valid ID is provided [Tag: API Testing]', async () => {
        const eventIds = getCreatedEventIds();
        const eventId = eventIds[0];
        console.log('Event ID for TC-117:', eventId);
        
        const deleteResponse = await request.delete(`/event/${eventId}`)
                                            .set('Accept', 'application/json');

        expect(deleteResponse.status).to.equal(200);

        const getResponse = await request.get(`/event/${eventId}`)
                                         .set('Accept', 'application/json');

        expect(getResponse.status).to.equal(404);
        expect(getResponse.body).to.have.property('error', 'Not Found');
    });

    it('TC-119: Verify System Response When Deleting Event ID That Does Not Exist in Database [Tag: Bug]', async () => {
        const nonExistentEventId = '0';
    
        const response = await request.delete(`/event/${nonExistentEventId}`)
                                      .set('Accept', 'application/json');
    
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Event not found');
    });
    
});
