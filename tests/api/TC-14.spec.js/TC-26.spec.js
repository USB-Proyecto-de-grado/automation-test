const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, getCreatedUserId } = require('../../hooks/user/userHooks');

describe('User API Test - DELETE Requests [Tag: API Testing]', () => {

    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await deleteTestUser();
    });

    it('TC-26: Verify response when deleting user ID that does not exist [Tag: API Testing] [Tag: Negative Testing] [Tag: Bug]', async () => {
        // Given: A non-existent user ID (assuming 0 is not a valid user ID)
        const nonExistentUserId = 0;
        
        // When: Sending a DELETE request for a non-existent user ID
        const response = await request.delete(`/user/${nonExistentUserId}`)
                                      .set('Accept', 'application/json');

        // Then: Expect the server to respond with a status indicating the user ID does not exist
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'User ID does not exist.');
    });
});