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

    it('TC-25: Verify successful deletion of user when valid ID is provided [Tag: API Testing] [Tag: Acceptance Testing] [Tag: Bug]', async () => {
        // Given: A valid user ID from the created test user
        const userId = getCreatedUserId();
        console.log('User ID for TC-25:', userId);
        
        // When: Sending a DELETE request to remove the user by valid ID
        const deleteResponse = await request.delete(`/user/${userId}`)
                                            .set('Accept', 'application/json');

        // Then: Expect the deletion to be successful and confirm with a follow-up GET request
        expect(deleteResponse.status).to.equal(200);
        expect(deleteResponse.body).to.have.property('message', 'User successfully deleted.');

        // Follow-up GET request to confirm deletion
        const getResponse = await request.get(`/user/${userId}`)
                                         .set('Accept', 'application/json');

        expect(getResponse.status).to.equal(404);
        expect(getResponse.body).to.have.property('error', 'User ID does not exist.');
    });
});