const supertest = require('supertest');
const config = require('../../../../config');
const request = supertest(config.apiUrl);

let createdUserId;
let createdUbicationId;

const createTestUser = async () => {
    const user = { name: 'testUser', email: 'testUser@example.com' };
    const response = await request.post('/user')
                                  .send(user)
                                  .set('Accept', 'application/json')
                                  .set('Content-Type', 'application/json')
                                  .expect('Content-Type', /json/);
    
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
                                  .set('Accept', 'application/json')
                                  .set('Content-Type', 'application/json')
                                  .expect('Content-Type', /json/);

    if (response.status === 201) {
        createdUbicationId = response.body.id;
    } else {
        throw new Error('Error creating test ubication');
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

module.exports = { createTestUser, createTestUbication, deleteTestUser, deleteTestUbication, getCreatedUserId: () => createdUserId, getCreatedUbicationId: () => createdUbicationId };
