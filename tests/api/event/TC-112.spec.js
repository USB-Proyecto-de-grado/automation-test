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

    it('TC-112: Verify successful retrieval of event entry when valid ID is provided [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: An event ID from the created events to be retrieved
        const eventIds = getCreatedEventIds();
        const eventId = eventIds[0];
        console.log('Event ID for TC-112:', eventId);
        
        // When: Sending a GET request to retrieve the event details
        const response = await request.get(`/event/${eventId}`)
                                      .set('Accept', 'application/json');
        
        // Then: Expect the event details to be correctly returned and match the created event
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', eventId);
        expect(response.body).to.have.property('title');
        expect(response.body).to.have.property('description');
        expect(response.body).to.have.property('fileUrl');
        expect(response.body).to.have.property('isPublished');
        expect(response.body).to.have.property('publicationDate');
        expect(response.body).to.have.property('eventDate');
        expect(response.body).to.have.property('cost');
    });
});
