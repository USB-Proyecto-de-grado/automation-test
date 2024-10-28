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

    it('TC-117: Verify successful deletion of event entry when valid ID is provided [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: An event ID from the created events to be deleted
        const eventIds = getCreatedEventIds();
        const eventId = eventIds[0];
        console.log('Event ID for TC-117:', eventId);

        // When: Sending a DELETE request to the API
        const deleteResponse = await request.delete(`/event/${eventId}`)
                                            .set('Accept', 'application/json');
        
        // Then: Expect a successful HTTP response indicating deletion with 200 status code
        expect(deleteResponse.status).to.equal(200);
        
        // When: Sending a GET request to confirm the event entry has been deleted
        const getResponse = await request.get(`/event/${eventId}`)
                                         .set('Accept', 'application/json');
        
        // Then: Expect the API to respond with HTTP 404 Not Found
        expect(getResponse.status).to.equal(404);
        expect(getResponse.body).to.have.property('error', 'Not Found');
    });
});
