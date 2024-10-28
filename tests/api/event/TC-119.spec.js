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

     it('TC-119: Verify System Response When Deleting Event ID That Does Not Exist in Database [Tag: API Testing] [Tag: Acceptance Testing] [Tag: Bug]', async () => {
        // Given: A non-existent event ID to test deletion process
        const nonExistentEventId = '0';  // Assuming '0' is an ID that would never be valid
        
        // When: Sending a DELETE request for a non-existent event ID
        const response = await request.delete(`/event/${nonExistentEventId}`)
                                      .set('Accept', 'application/json');
        
        // Then: Expect a HTTP 404 Not Found status indicating no such event exists
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Event not found');
    });
});