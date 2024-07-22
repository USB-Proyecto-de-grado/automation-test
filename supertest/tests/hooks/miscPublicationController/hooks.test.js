const { createTestUser, deleteTestUser, createMiscPublicationEntries, deleteMiscPublicationEntries, getCreatedUserId, getCreatedMiscPublicationIds } = require('./miscPublicationHooks');

describe('Hooks Test - Miscellaneous Publication Creation and Deletion', () => {

    before(async () => {
        await createTestUser();
        await createMiscPublicationEntries(5);
    });

    after(async () => {
        await deleteMiscPublicationEntries();
        await deleteTestUser();
    });

    it('should have created user and miscellaneous publication entries before running tests', async () => {
        const userId = getCreatedUserId();
        const miscPublicationIds = getCreatedMiscPublicationIds();
        console.log('Created User ID:', userId);
        console.log('Created Miscellaneous Publication IDs:', miscPublicationIds);
        expect(userId).to.be.a('number');
        expect(miscPublicationIds).to.be.an('array').that.is.not.empty;
        expect(miscPublicationIds).to.have.lengthOf(5);
    });
});
