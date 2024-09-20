const { createTestUser, createTestUbication, createEventEntries, deleteEventEntries, deleteTestUserAndUbication, getCreatedEventIds, getCreatedUserId, getCreatedUbicationId } = require('./eventHooks');
const expect = require('chai').expect;

describe('Hooks Test - Event Creation and Deletion', () => {
    before(async () => {
        await createTestUser();
        await createTestUbication();
        await createEventEntries(5);
    });

    after(async () => {
        await deleteEventEntries();
        await deleteTestUserAndUbication();
    });

    it('should have created user, ubication, and event entries before running tests', async () => {
        const eventIds = getCreatedEventIds();
        const userId = getCreatedUserId();
        const ubicationId = getCreatedUbicationId();

        console.log('Created Event IDs:', eventIds);
        console.log('Created User ID:', userId);
        console.log('Created Ubication ID:', ubicationId);

        expect(userId).to.not.be.null;
        expect(ubicationId).to.not.be.null;
        expect(eventIds).to.have.lengthOf(5);
    });
});
