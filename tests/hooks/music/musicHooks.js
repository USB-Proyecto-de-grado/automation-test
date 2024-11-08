const supertest = require('supertest');
const config = require('../../../config');
const request = supertest(config.apiUrl);

let createdUserId;
let createdMusicIds = [];

const createTestUser = async () => {
    const user = { name: 'musicTestUser', email: 'music@example.com', roleId: 1 };
    const response = await request.post('/user')
                                  .send(user)
                                  .set('Accept', 'application/json');
    
    if (response.status === 201) {
        createdUserId = response.body.id;
    } else {
        throw new Error('Error creating test user');
    }
};

const createMusicEntries = async (numEntries = 1) => {
    const musicData = [];
    for (let i = 1; i <= numEntries; i++) {
        musicData.push({
            title: `Test Music ${i}`,
            description: `This is the description for Test Music ${i}`,
            youTubeLink: `http://youtube.com/test${i}`,
            isPublished: true,
            publicationDate: '2020-12-05',
            userId: createdUserId
        });
    }

    createdMusicIds = [];

    for (const music of musicData) {
        const response = await request.post('/music')
                                      .send(music)
                                      .set('Accept', 'application/json');

        if (response.status === 201) {
            createdMusicIds.push(response.body.id);
        } else {
            throw new Error('Error creating music entry');
        }
    }
};

const deleteMusicEntries = async () => {
    for (const musicId of createdMusicIds) {
        await request.delete(`/music/${musicId}`)
                     .set('Accept', 'application/json')
        await request.delete(`/music/`).set('Accept', 'application/json')
    }
    createdMusicIds = [];
};

const deleteTestUser = async () => {
    if (createdUserId) {
        await request.delete(`/user/${createdUserId}`)
                     .set('Accept', 'application/json')
                     .expect(200);
        createdUserId = null;
    }
};

const addCreatedMusicId = (musicId) => {
    createdMusicIds.push(musicId);
};

module.exports = { addCreatedMusicId, createTestUser, createMusicEntries, deleteMusicEntries, deleteTestUser, getCreatedMusicIds: () => createdMusicIds, getCreatedUserId: () => createdUserId };
