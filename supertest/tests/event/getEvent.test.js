const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createEventEntries, getCreatedUserId, createTestUbication, deleteTestUbication, deleteEventEntries, getCreatedUbicationId } = require('../hooks/event/eventHooks');

describe('Event API Test - DELETE Requests', () => {

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

    it('TC-112: Verify successful retrieval of event entry when valid ID is provided', async () => {
        const eventIds = getCreatedEventIds();
        const eventId = eventIds[0];
        console.log('Event ID for TC-112:', eventId);
        
        const response = await request.get(`/event/${eventId}`)
                                      .set('Accept', 'application/json');

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', eventId);
        expect(response.body).to.have.property('title');
        expect(response.body).to.have.property('description');
        expect(response.body).to.have.property('fileUrl');
        expect(response.body).to.have.property('isPublished');
        expect(response.body).to.have.property('publicationDate');
        expect(response.body).to.have.property('eventDate');
        expect(response.body).to.have.property('userId');
        expect(response.body).to.have.property('ubicationId');
        expect(response.body).to.have.property('cost');
    });

    it('TC-113: Verify response when invalid event ID format is submitted', async () => {
        const invalidEventId = -1;
        
        const response = await request.get(`/event/${invalidEventId}`)
                                      .set('Accept', 'application/json');

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error', 'Invalid event ID format.');
    });

    it('TC-114: Verify system response when event ID does not exist in the database', async () => {
        const nonExistentEventId = 0;
        
        const response = await request.get(`/event/${nonExistentEventId}`)
                                      .set('Accept', 'application/json');

        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Event ID does not exist.');
    });
});
