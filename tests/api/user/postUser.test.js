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

    it('TC-14: Verify the user is correctly created with the admin role', async () => {
        const userData = {
            "name": "example",
            "email": "example@example.com",
            "roleId": 1
        };

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Content-Type', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('name', userData.name);
        expect(response.body).to.have.property('email', userData.email);
        expect(response.body.role).to.have.property('id', userData.roleId);
        expect(response.body.role).to.have.property('roleName', 'admin');

        createdUserIds.push(response.body.id);
    });

    it('TC-149: Verify the user is correctly created with the student role', async () => {
        const userData = {
            "name": "example",
            "email": "example@example.com",
            "roleId": 2
        };

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Content-Type', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('name', userData.name);
        expect(response.body).to.have.property('email', userData.email);
        expect(response.body.role).to.have.property('id', userData.roleId);
        expect(response.body.role).to.have.property('roleName', 'student');

        createdUserIds.push(response.body.id);
    });


    it('TC-148: Verify the user is correctly created with the teacher role', async () => {
        const userData = {
            "name": "example",
            "email": "example@example.com",
            "roleId": 3
        };

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Content-Type', 'application/json')
                                      .expect('Content-Type', /json/);
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('name', userData.name);
        expect(response.body).to.have.property('email', userData.email);
        expect(response.body.role).to.have.property('id', userData.roleId);
        expect(response.body.role).to.have.property('roleName', 'teacher');

        createdUserIds.push(response.body.id);
    });


    it('TC-15: Verify the user is correctly created when the name has special characters', async () => {
        const userData = {
            "name": "example@#&!",
            "email": "example.special@example.com",
            "roleId": 1
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
            "name": "example",
            "roleId": 1
        };

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error', 'Bad Request');
        expect(response.body.message).to.include.members([
            "Provide valid Email", 
            "email should not be empty"
        ]);
    });

    it('TC-17: Should not create a user when the name is missing', async () => {
        const userData = {
            "email": "example@example.com",
            "roleId": 1
        };

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error', 'Bad Request');
        expect(response.body.message).to.include.members([
            "name should not be empty",
            "Name must have at least 2 characters",
            "name must be a string"
        ]);
    });

    it('TC-18: Should not create a user with invalid email format', async () => {
        const userData = {
            "name": "example",
            "email": "invalid-email",
            "roleId": 1
        };

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error', 'Bad Request');
        expect(response.body.message).to.include.members([
            "Provide valid Email"
        ]);
    });

    it('TC-19: Should not create a user with duplicate email', async () => {
        const userData = {
            "name": "example",
            "email": "duplicate@example.com",
            "roleId": 1
        };

        const first = await request.post('/user')
                     .send(userData)
                     .set('Accept', 'application/json')
                     .set('Content-Type', 'application/json')
                     .expect(201);

        createdUserIds.push(first.body.id);

        const response = await request.post('/user')
                                      .send(userData)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');

        expect(response.status).to.equal(400); 
        expect(response.body).to.have.property('error', 'Bad Request');
        expect(response.body).to.have.property('message', 'User with email duplicate@example.com is already registered');
    });
});