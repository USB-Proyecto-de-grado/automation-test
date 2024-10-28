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

    it('TC-22: Verify system response when user ID is negative [Tag: API Testing] [Tag: Negative Testing]', async () => {
        // Given: A high non-existent user ID to simulate an unassigned ID scenario
        const nonExistentUserId = 999999;
        
        // When: Sending a GET request for a user ID that is not assigned
        const response = await request.get(`/user/${nonExistentUserId}`)
                                      .set('Accept', 'application/json');

        // Then: Expect the response to indicate the user ID does not exist with status 404
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'Not Found');
        expect(response.body).to.have.property('message', 'Item with id 999999 not found');
    });
});