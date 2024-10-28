const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createEventEntries, getCreatedUserId, createTestUbication, deleteTestUbication, deleteEventEntries, getCreatedEventIds, addCreatedEventId } = require('../../hooks/event/eventHooks');

describe('Event API Test - DELETE Requests [Tag: API Testing]', () => {

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

    it('TC-113: Verify response when invalid event ID format is submitted [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: An invalid event ID to test error handling
        const invalidEventId = -1;  // Negative ID, which is assumed to be invalid
        
        // When: Sending a GET request with an invalid event ID
        const response = await request.get(`/event/${invalidEventId}`)
                                      .set('Accept', 'application/json');
        
        // Then: Expect the API to respond with HTTP 404 Not Found
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Not Found');
        expect(response.body).to.have.property('message', 'Item with id -1 not found');  // Specific error message for this test case
    });
});
