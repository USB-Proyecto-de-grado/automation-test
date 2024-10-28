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

    it('TC-100: Verify Response When Publication Date is in an Incorrect Format in the Event Request [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: Publication date is in an incorrect format
        const event = {
            title: 'Concierto No. 2 de Orquesta Coral',
            description: 'Echa un vistazo al concierto de Orquesta Coral que se llevará a cabo en enero',
            fileUrl: 'http://drive.url?file=1232332',
            isPublished: true,
            publicationDate: 'invalid-date',
            eventDate: '2020-12-03',
            userId: getCreatedUserId(),
            ubicationId: getCreatedUbicationId(),
            cost: 50
        };

        // When: Posting to create an event with an incorrect format for publication date
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');

        // Then: Expect a failure due to incorrect format for publication date, with status 400 and appropriate error message
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });
});
