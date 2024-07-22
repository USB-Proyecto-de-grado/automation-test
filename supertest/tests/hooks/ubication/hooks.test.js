const { createUbications, deleteUbications, getCreatedUbicationIds } = require('./ubicationHooks');
const expect = require('chai').expect;

describe('Hooks Test - Ubication Creation and Deletion', () => {
    before(async () => {
        await createUbications(5);
    });

    after(async () => {
        try {
            await deleteUbications();
            console.log('Deleted all created ubications');
        } catch (error) {
            console.error('Error in after hook:', error);
        }
    });

    it('should have created ubications before running tests', () => {
        const createdUbicationIds = getCreatedUbicationIds();
        console.log('Ubication IDs after creation:', createdUbicationIds);
        expect(createdUbicationIds).to.not.be.undefined;
        expect(createdUbicationIds).to.be.an('array').that.is.not.empty;
        expect(createdUbicationIds).to.have.lengthOf(5);
    });
});
