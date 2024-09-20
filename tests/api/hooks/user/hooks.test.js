const { createUsers, deleteUsers, getCreatedUserIds } = require('./userHooks');
const expect = require('chai').expect;

describe('Hooks Test - User Creation and Deletion', () => {
    before(async () => {
        try {
            await createUsers(5);
            console.log('Created User IDs:', getCreatedUserIds());
        } catch (error) {
            console.error('Error in before hook:', error);
        }
    });

    after(async () => {
        try {
            await deleteUsers();
            console.log('Deleted all created users');
        } catch (error) {
            console.error('Error in after hook:', error);
        }
    });

    it('should have created users before running tests', () => {
        const createdUserIds = getCreatedUserIds();
        console.log('User IDs after creation:', createdUserIds);
        expect(createdUserIds).to.not.be.undefined;
        expect(createdUserIds).to.be.an('array').that.is.not.empty;
        expect(createdUserIds).to.have.lengthOf(5);
    });
});
