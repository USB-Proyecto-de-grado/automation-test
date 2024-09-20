const supertest = require('supertest');
const config = require('../../../../config');
const request = supertest(config.apiUrl);

let createdUserId;
let createdUbicationId;
let createdEventIds = [];

const createTestUser = async () => {
    const user = { name: 'testUser', email: 'testUser@example.com' };
    const response = await request.post('/user')
                                  .send(user)
                                  .set('Accept', 'application/json');
    
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
            publicationDate: '2020-12-03',
            eventDate: '2020-12-03',
            userId: createdUserId,
            ubicationId: createdUbicationId,
            cost: 50
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

module.exports = { createTestUser, createTestUbication, createEventEntries, deleteTestUser, deleteTestUbication, deleteEventEntries, getCreatedUserId: () => createdUserId, getCreatedUbicationId: () => createdUbicationId, getCreatedEventIds: () => createdEventIds };
