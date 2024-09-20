const { createTestUser, createMusicEntries, deleteMusicEntries, deleteTestUser, getCreatedMusicIds, getCreatedUserId } = require('./musicHooks');
const expect = require('chai').expect;

describe('Hooks Test - Music Creation and Deletion', () => {
    before(async () => {
        try {
            await createTestUser();
            console.log('Created User ID:', getCreatedUserId());
            await createMusicEntries(5);
            console.log('Created Music IDs:', getCreatedMusicIds());
        } catch (error) {
            console.error('Error in before hook:', error);
        }
    });

    after(async () => {
        try {
            await deleteMusicEntries();
            console.log('Deleted all created music entries');
            await deleteTestUser();
            console.log('Deleted test user');
        } catch (error) {
            console.error('Error in after hook:', error);
        }
    });

    it('should have created user and music entries before running tests', () => {
        const createdUserId = getCreatedUserId();
        const createdMusicIds = getCreatedMusicIds();
        expect(createdUserId).to.not.be.undefined;
        expect(createdMusicIds).to.not.be.undefined;
        expect(createdMusicIds).to.be.an('array').that.is.not.empty;
        expect(createdMusicIds).to.have.lengthOf(5);
    });
});
