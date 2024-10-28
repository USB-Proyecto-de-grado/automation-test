const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);

const { createTestUser, deleteTestUser, getCreatedUserId } = require('../../hooks/user/userHooks');

describe('User API Test - POST Requests [Tag: API Testing]', () => {
    let createdUserIds = [];

    afterEach(async () => {
        for (const userId of createdUserIds) {
            try {
                await request.delete(`/user/${userId}`)
                              .set('Accept', 'application/json')
                              .expect(200);
                console.log('User deleted with ID:', userId);
            } catch (error) {
                console.error('Error deleting user with ID:', userId, error);
            }
        }
        createdUserIds = [];
        await deleteTestUser();
    });

    it('TC-19: Should not create a user with duplicate email [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: User data with a duplicate email
        const userData = {
            "name": "example",
            "email": "duplicate@example.com",
            "roleId": 1
        };

        // When: Creating a user for the first time and then attempting to create another with the same email
        const first = await request.post('/user')
                     .send(userData)
                     .set('Accept', 'application/json')
                     .set('Content-Type', 'application/json')
                     .expect(201);

        createdUserIds.push(first.body.id);

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        // Then: Expect the second creation attempt to fail due to duplicate email
        expect(response.status).to.equal(400); 
        expect(response.body).to.have.property('error', 'Bad Request');
        expect(response.body).to.have.property('message', 'User with email duplicate@example.com is already registered');
    });
});