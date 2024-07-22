const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, getCreatedUserId } = require('../hooks/user/userHooks');

describe('User API Test - GET Requests (All Users)', () => {

    before(async () => {
        await createTestUser();
    });

    after(async () => {
        await deleteTestUser();
    });

    it('TC-23: Verify successful retrieval of all users', async () => {
        const response = await request.get('/users')
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.greaterThan(0);
    });
});
