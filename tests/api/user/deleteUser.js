const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, getCreatedUserId } = require('../hooks/user/userHooks');

describe('User API Test - DELETE Requests', () => {

    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await deleteTestUser();
    });

    it('TC-25: Verify successful deletion of user when valid ID is provided', async () => {
        const userId = getCreatedUserId();
        console.log('User ID for TC-25:', userId);
        
        const deleteResponse = await request.delete(`/user/${userId}`)
                                            .set('Accept', 'application/json')
                                            .expect('Content-Type', /json/);

        expect(deleteResponse.status).to.equal(200);
        expect(deleteResponse.body).to.have.property('message', 'User successfully deleted.');

        const getResponse = await request.get(`/user/${userId}`)
                                         .set('Accept', 'application/json')
                                         .expect('Content-Type', /json/);

        expect(getResponse.status).to.equal(404);
        expect(getResponse.body).to.have.property('error', 'User ID does not exist.');
    });

    it('TC-26: Verify response when deleting user ID that does not exist in the database', async () => {
        const nonExistentUserId = 0;
        
        const response = await request.delete(`/user/${nonExistentUserId}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);

        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error', 'User ID does not exist.');
    });
});