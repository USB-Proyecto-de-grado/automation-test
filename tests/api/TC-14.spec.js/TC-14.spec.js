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

    it('TC-14: Verify the user is correctly created with the admin role [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: User data for an admin role
        const userData = {
            "name": "example",
            "email": "example@example.com",
            "roleId": 1
        };

        // When: Sending a POST request to create a user with admin role
        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Content-Type', 'application/json')
                                      .expect('Content-Type', /json/);

        // Then: Expect the user creation to be successful and role to be admin
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('name', userData.name);
        expect(response.body).to.have.property('email', userData.email);
        expect(response.body.role).to.have.property('id', userData.roleId);
        expect(response.body.role).to.have.property('roleName', 'admin');
        createdUserIds.push(response.body.id);
    });
});