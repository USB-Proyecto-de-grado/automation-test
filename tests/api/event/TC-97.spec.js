const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, getCreatedUserId, createTestUbication, deleteTestUbication, getCreatedUbicationId, deleteEventEntries, addCreatedEventId, getCreatedEventIds } = require('../../hooks/event/eventHooks');

describe('Event API Test - POST Requests [Tag: API Testing]', () => {

    before(async () => {
        await createTestUser();
        await createTestUbication();
    });

    after(async () => {
        await deleteEventEntries();
        await deleteTestUser();
        await deleteTestUbication();
    });

    it('TC-97: Verify Response When Description Field is Missing in the Event Request [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: Description field is missing in the event request
        const event = {
            title: 'Concierto No. 2 de Orquesta Coral',
            fileUrl: 'http://drive.url?file=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            eventDate: '2020-12-03',
            userId: getCreatedUserId(),
            ubicationId: getCreatedUbicationId(),
            cost: 50
        };

        // When: Posting to create an event without the description field
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');

        // Then: Expect a failure due to missing description field, with status 400 and appropriate error message
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });
});
