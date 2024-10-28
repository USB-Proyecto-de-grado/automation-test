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

    it('TC-101: Verify Response When Event Date is in the Past [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: Event date is set in the past
        const event = {
            title: 'Concierto No. 2 de Orquesta Coral',
            description: 'Echa un vistazo al concierto de Orquesta Coral que se llevará a cabo en enero',
            fileUrl: 'http://drive.url?file=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            eventDate: '2000-12-03',  // Past date
            userId: getCreatedUserId(),
            ubicationId: getCreatedUbicationId(),
            cost: 50
        };

        // When: Posting to create an event with a past event date
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');

        // Then: Expect successful submission even with a past event date (assuming it is allowed), with status 201 and verification of response properties
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('title', event.title);
        expect(response.body).to.have.property('description', event.description);
        expect(response.body).to.have.property('fileUrl', event.fileUrl);
        expect(response.body).to.have.property('isPublished', event.isPublished);
        expect(response.body).to.have.property('publicationDate', event.publicationDate);
        expect(response.body).to.have.property('eventDate', event.eventDate);
        expect(response.body).to.have.property('cost', event.cost);
        addCreatedEventId(response.body.id);
    });
});
