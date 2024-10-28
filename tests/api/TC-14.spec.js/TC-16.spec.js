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

    it('TC-16: Should not create a user when the email is missing [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: User data without an email
        const userData = {
            "name": "example",
            "roleId": 1
        };

        // When: Sending a POST request without an email
        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        // Then: Expect the request to fail due to missing email
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error', 'Bad Request');
        expect(response.body.message).to.include.members([
            "Provide valid Email", 
            "email should not be empty"
        ]);
    });
});