const supertest = require('supertest');
const config = require('../../../config');
const request = supertest(config.apiUrl);

let createdUserId;
let createdUbicationId;
let createdEventIds = [];

const createTestUser = async () => {
    const user = { name: 'eventTestUser', email: 'eventTestUser@example.com', roleId: 1  };
    const response = await request.post('/user')
                                  .send(user)
                                  .set('Accept', 'application/json');
    console.log(response)
    if (response.status === 201) {
        createdUserId = response.body.id;
    } else {
        throw new Error('Error creating test user');
    }
};

const createTestUbication = async () => {
    const ubication = { ubicationName: 'Test Location' };
    const response = await request.post('/ubication')
                                  .send(ubication)
                                  .set('Accept', 'application/json');

    if (response.status === 201) {
        createdUbicationId = response.body.id;
    } else {
        throw new Error('Error creating test ubication');
    }
};

const createEventEntries = async (numEvents = 1) => {
    createdEventIds = [];
    
    for (let i = 0; i < numEvents; i++) {
        const event = {
            title: `Test Event ${i + 1}`,
            description: `Description for Test Event ${i + 1}`,
            fileUrl: 'http://drive.url?file=1232332',
            isPublished: true,
            publicationDate: '2024-12-03',
            eventDate: '2020-12-03',
            userId: createdUserId,
            ubicationId: createdUbicationId,
            cost: 50,
            currentStatus: "Accepted"
        };
        
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');
        
        if (response.status === 201) {
            createdEventIds.push(response.body.id);
        } else {
            throw new Error('Error creating test event');
        }
    }
};

const createEventEntriesByDate = async (numEvents = 1, eventDate = '2024-12-05') => {
    const eventData = [];
    for (let i = 1; i <= numEvents; i++) {
        eventData.push({
            title: `Test Event ${i}`,
            description: `Description for Test Event ${i}`,
            fileUrl: 'http://drive.url?file=1232332',
            isPublished: true,
            publicationDate: eventDate, // Use provided or default date
            eventDate, // Use provided or default date
            userId: createdUserId,
            ubicationId: createdUbicationId,
            cost: 50,
            currentStatus: "Accepted"
        });
    }

    createdEventIds = [];

    for (const event of eventData) {
        const response = await request.post('/event')
                                      .send(event)
                                      .set('Accept', 'application/json');
        console.log(response)
        if (response.status === 201) {
            createdEventIds.push(response.body.id);
        } else {
            throw new Error('Error creating event entry');
        }
    }
};


const deleteTestUser = async () => {
    if (createdUserId) {
        await request.delete(`/user/${createdUserId}`)
                     .set('Accept', 'application/json')
                     .expect(200);
        createdUserId = null;
    }
};

const deleteTestUbication = async () => {
    if (createdUbicationId) {
        await request.delete(`/ubication/${createdUbicationId}`)
                     .set('Accept', 'application/json')
                     .expect(200);
        createdUbicationId = null;
    }
};

const deleteEventEntries = async () => {
    for (const eventId of createdEventIds) {
        await request.delete(`/event/${eventId}`)
                     .set('Accept', 'application/json')
                     .expect(200);
    }
    createdEventIds = [];
};

const addCreatedEventId = (eventId) => {
    createdEventIds.push(eventId);
};

module.exports = { createTestUser, createTestUbication, createEventEntries, deleteTestUser, createEventEntriesByDate, deleteTestUbication, deleteEventEntries, getCreatedUserId: () => createdUserId, getCreatedUbicationId: () => createdUbicationId, getCreatedEventIds: () => createdEventIds, addCreatedEventId  };
