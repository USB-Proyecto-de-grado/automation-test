const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);

const { createTestUser, deleteTestUser, getCreatedUserId } = require('../hooks/user/userHooks');

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

    it('TC-14: Verify the user is correctly created', async () => {
        const userData = {
            "name": "example",
            "email": "example@example.com"
        };

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('name', userData.name);
        expect(response.body).to.have.property('email', userData.email);

        createdUserIds.push(response.body.id);
    });

    it('TC-15: Verify the user is correctly created when the name has special characters', async () => {
        const userData = {
            "name": "example@#&!",
            "email": "example.special@example.com"
        };

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('name', userData.name);
        expect(response.body).to.have.property('email', userData.email);

        createdUserIds.push(response.body.id);
    });

    it('TC-16: Should not create a user when the email is missing', async () => {
        const userData = {
            "name": "example"
        };

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error', 'Email is required');
    });

    it('TC-17: Should not create a user when the name is missing', async () => {
        const userData = {
            "email": "example@example.com"
        };

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error', 'Name is required');
    });

    it('TC-18: Should not create a user with invalid email format', async () => {
        const userData = {
            "name": "example",
            "email": "invalid-email"
        };

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error', 'Invalid email format');
    });

    it('TC-19: Should not create a user with duplicate email', async () => {
        const userData = {
            "name": "example",
            "email": "duplicate@example.com"
        };

        await request.post('/user')
                     .send(userData)
                     .set('Accept', 'application/json')
                     .set('Content-Type', 'application/json')
                     .expect(201);

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        expect(response.status).to.equal(409);
        expect(response.body).to.have.property('error', 'Email already exists');
    });
});