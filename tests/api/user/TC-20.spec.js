const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, getCreatedUserId } = require('../../hooks/user/userHooks');

describe('User API Test - GET Requests (By ID) [Tag: API Testing]', () => {

    before(async () => {
        await createTestUser();
    });

    after(async () => {
        await deleteTestUser();
    });

    it('TC-20: Verify successful retrieval of user data when valid ID is provided [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // Given: A valid user ID from the created test user
        const userId = getCreatedUserId();
        console.log('User ID for TC-20:', userId);
        
        // When: Sending a GET request to retrieve user data by valid ID
        const response = await request.get(`/user/${userId}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);

        // Then: Expect the response to be successful and to correctly display the user details
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', userId);
        expect(response.body).to.have.property('name');
        expect(response.body).to.have.property('email');
    });
});