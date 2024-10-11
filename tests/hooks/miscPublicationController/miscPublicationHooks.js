const supertest = require('supertest');
const config = require('../../../../config');
const request = supertest(config.apiUrl);

let createdUserId;
let createdMiscPublicationIds = [];

const createTestUser = async () => {
    const user = { name: 'publicationTest', email: 'publication@example.com', roleId: 1 };
    const response = await request.post('/user')
                                  .send(user)
                                  .set('Accept', 'application/json');
    
    if (response.status === 201) {
        createdUserId = response.body.id;
    } else {
        throw new Error('Error creating test user');
    }
};

const createMiscPublicationEntries = async (numEntries = 3) => {
    const miscPublicationData = [];
    for (let i = 1; i <= numEntries; i++) {
        miscPublicationData.push({
            title: `Misc Publication ${i}`,
            description: `This is the description for Misc Publication ${i}`,
            fileUrl: `http://file.url/test${i}`,
            isPublished: true,
            publicationDate: '2020-12-05',
            userId: createdUserId
        });
    }

    createdMiscPublicationIds = [];

    for (const miscPublication of miscPublicationData) {
        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json');

        if (response.status === 201) {
            createdMiscPublicationIds.push(response.body.id);
        } else {
            throw new Error('Error creating misc publication entry');
        }
    }
};

const deleteMiscPublicationEntries = async () => {
    for (const miscPublicationId of createdMiscPublicationIds) {
        await request.delete(`/miscPublication/${miscPublicationId}`)
                     .set('Accept', 'application/json')
                     .expect(200);
    }
    createdMiscPublicationIds = [];
};

const deleteTestUser = async () => {
    if (createdUserId) {
        await request.delete(`/user/${createdUserId}`)
                     .set('Accept', 'application/json')
                     .expect(200);
        createdUserId = null;
    }
};

const addCreatedMiscPublicationId = (miscPublicationId) => {
    createdMiscPublicationIds.push(miscPublicationId);
};

module.exports = { addCreatedMiscPublicationId, createTestUser, createMiscPublicationEntries, deleteMiscPublicationEntries, deleteTestUser, getCreatedMiscPublicationIds: () => createdMiscPublicationIds, getCreatedUserId: () => createdUserId };
