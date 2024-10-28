const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createEventEntries, getCreatedUserId, createTestUbication, deleteTestUbication, deleteEventEntries, getCreatedUbicationId } = require('../../hooks/event/eventHooks');

describe('Event API Test - DELETE Requests [Tag: API Testing]', () => {

    before(async () => {
        await createTestUser();
        await createTestUbication();
        await createEventEntries(1);
    });

    after(async () => {
        await deleteEventEntries();
        await deleteTestUbication();
        await deleteTestUser();
    });

    it('TC-107: Verify successful retrieval of event list [Tag: API Testing] [Tag: Acceptance Testing]', async () => {
        // When: Sending a GET request to retrieve the list of events
        const response = await request.get('/event')
                                      .set('Accept', 'application/json');
        
        // Then: Expect the response to be successful and the data format to be correct
        expect(response.status).to.equal(200);  // The status should be 200 indicating a successful request
        expect(response.body).to.be.an('array');  // The body should be an array, representing the list of events
        expect(response.body.length).to.be.greater_than(0);  // The array should have at least one item, indicating there's data
    });
});
