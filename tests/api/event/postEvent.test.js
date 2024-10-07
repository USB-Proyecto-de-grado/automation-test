const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, getCreatedUserId, createTestUbication, deleteTestUbication, getCreatedUbicationId } = require('../hooks/event/eventHooks');

describe('Event API Test - POST Requests [Tag: API Testing]', () => {

    before(async () => {
        await createTestUser();
        await createTestUbication();
    });

    after(async () => {
        await deleteTestUser();
        await deleteTestUbication();
    });

    it('TC-95: Verify Successful Creation of Event Entry with All Required Fields Provided', async () => {
        const event = {
            title: 'Concierto No. 2 de Orquesta Coral',
            description: 'Echa un vistazo al concierto de Orquesta Coral que se llevará a cabo en enero',
            fileUrl: 'http://drive.url?file=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            eventDate: '2020-12-03',
            userId: getCreatedUserId(),
            ubicationId: getCreatedUbicationId(),
            cost: 50
        };
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('title', event.title);
        expect(response.body).to.have.property('description', event.description);
        expect(response.body).to.have.property('fileUrl', event.fileUrl);
        expect(response.body).to.have.property('isPublished', event.isPublished);
        expect(response.body).to.have.property('publicationDate', event.publicationDate);
        expect(response.body).to.have.property('eventDate', event.eventDate);
        expect(response.body).to.have.property('userId', event.userId);
        expect(response.body).to.have.property('ubicationId', event.ubicationId);
        expect(response.body).to.have.property('cost', event.cost);
    });

    it('TC-96: Verify Response When Title Field is Missing in the Event Request', async () => {
        const event = {
            description: 'Echa un vistazo al concierto de Orquesta Coral que se llevará a cabo en enero',
            fileUrl: 'http://drive.url?file=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            eventDate: '2020-12-03',
            userId: getCreatedUserId(),
            ubicationId: getCreatedUbicationId(),
            cost: 50
        };
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-97: Verify Response When Description Field is Missing in the Event Request', async () => {
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
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-98: Verify Response When File URL is Invalid in the Event Request', async () => {
        const event = {
            title: 'Concierto No. 2 de Orquesta Coral',
            description: 'Echa un vistazo al concierto de Orquesta Coral que se llevará a cabo en enero',
            fileUrl: 'invalid-url',
            isPublished: true,
            publicationDate: '2020-12-03',
            eventDate: '2020-12-03',
            userId: getCreatedUserId(),
            ubicationId: getCreatedUbicationId(),
            cost: 50
        };
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-99: Verify Response When isPublished Field is Missing in the Event Request', async () => {
        const event = {
            title: 'Concierto No. 2 de Orquesta Coral',
            description: 'Echa un vistazo al concierto de Orquesta Coral que se llevará a cabo en enero',
            fileUrl: 'http://drive.url?file=1232332',
            publicationDate: '2020-12-03',
            eventDate: '2020-12-03',
            userId: getCreatedUserId(),
            ubicationId: getCreatedUbicationId(),
            cost: 50
        };
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-100: Verify Response When Publication Date is in an Incorrect Format in the Event Request', async () => {
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
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-101: Verify Response When Event Date is in the Past', async () => {
        const event = {
            title: 'Concierto No. 2 de Orquesta Coral',
            description: 'Echa un vistazo al concierto de Orquesta Coral que se llevará a cabo en enero',
            fileUrl: 'http://drive.url?file=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            eventDate: '2000-12-03',
            userId: 1147,
            ubicationId: getCreatedUbicationId(),
            cost: 50
        };
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-102: Verify Response When UserID Field is Missing in the Event Request', async () => {
        const event = {
            title: 'Concierto No. 2 de Orquesta Coral',
            description: 'Echa un vistazo al concierto de Orquesta Coral que se llevará a cabo en enero',
            fileUrl: 'http://drive.url?file=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            eventDate: '2020-12-03',
            ubicationId: getCreatedUbicationId(),
            cost: 50
        };
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-103: Verify Response When UbicationID Field is Missing in the Event Request', async () => {
        const event = {
            title: 'Concierto No. 2 de Orquesta Coral',
            description: 'Echa un vistazo al concierto de Orquesta Coral que se llevará a cabo en enero',
            fileUrl: 'http://drive.url?file=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            eventDate: '2020-12-03',
            userId: 1147,
            cost: 50
        };
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-104: Verify Response When Cost Field is Negative in the Event Request', async () => {
        const event = {
            title: 'Concierto No. 2 de Orquesta Coral',
            description: 'Echa un vistazo al concierto de Orquesta Coral que se llevará a cabo en enero',
            fileUrl: 'http://drive.url?file=1232332',
            isPublished: true,
            publicationDate: '2020-12-03',
            eventDate: '2020-12-03',
            userId: 1147,
            ubicationId: getCreatedUbicationId(),
            cost: -50
        };
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });
});
