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

    it('TC-114: Verify system response when event ID does not exist in the database [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: An ID for an event that does not exist
        const nonExistentEventId = 0; // Typically, '0' is considered a non-valid ID for most databases
        
        // When: Attempting to retrieve details for a non-existent event ID
        const response = await request.get(`/event/${nonExistentEventId}`)
                                      .set('Accept', 'application/json');
        
        // Then: Expect the API to respond with an error indicating the event was not found
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Not Found');
        expect(response.body).to.have.property('message', 'Item with id 0 not found');
    });
});
