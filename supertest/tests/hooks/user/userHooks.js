const supertest = require('supertest');
const config = require('../../../../config');
const request = supertest(config.apiUrl);

let createdUserId;

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

const deleteTestUser = async () => {
    if (createdUserId) {
        await request.delete(`/user/${createdUserId}`)
                     .set('Accept', 'application/json')
                     .expect(200);
        createdUserId = null;
    }
};

const getCreatedUserId = () => createdUserId;

module.exports = { createTestUser, deleteTestUser, getCreatedUserId };