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

    it('TC-20: Verify successful retrieval of user data when valid ID is provided', async () => {
        const userId = getCreatedUserId();
        console.log('User ID for TC-20:', userId);
        
        const response = await request.get(`/user/${userId}`)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', userId);
        expect(response.body).to.have.property('name');
        expect(response.body).to.have.property('email');
    });

    it('TC-21: Verify response when invalid user ID format is submitted', async () => {
        const invalidUserId = 0;
        
        const response = await request.get(`/user/${invalidUserId}`)
                                      .set('Accept', 'application/json');

        expect(response.status).to.equal(404); 
        expect(response.body).to.have.property('error', 'Not Found');
        expect(response.body).to.have.property('message', 'Item with id 0 not found');
    });

    it('TC-22: Verify system response when user ID is negative', async () => {
        const nonExistentUserId = 999999;
        
        const response = await request.get(`/user/${nonExistentUserId}`)
                                      .set('Accept', 'application/json');

        expect(response.status).to.equal(404); 
        expect(response.body).to.have.property('error', 'Not Found');
        expect(response.body).to.have.property('message', 'Item with id 999999 not found');
    });
});