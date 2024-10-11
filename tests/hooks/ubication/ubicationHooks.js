const supertest = require('supertest');
const config = require('../../../../config');
const request = supertest(config.apiUrl);

let createdUbicationIds = [];

const createUbications = async (numUbications = 3) => {
    const ubicationData = [];
    for (let i = 1; i <= numUbications; i++) {
        ubicationData.push({ ubicationName: `Ubication ${i}` });
    }

    createdUbicationIds = [];

    for (const ubication of ubicationData) {
        const response = await request.post('/ubication')
                                      .send(ubication)
                                      .set('Accept', 'application/json')
                                      .expect('Content-Type', /json/);

        if (response.status === 201) {
            createdUbicationIds.push(response.body.id);
        } else {
            throw new Error('Error creating ubication');
        }
    }
};

const deleteUbications = async () => {
    for (const ubicationId of createdUbicationIds) {
        try {
            const response = await request.delete(`/ubication/${ubicationId}`)
                                          .set('Accept', 'application/json')
                                          .expect(200)
            console.log('Ubication deleted with ID:', ubicationId);
        } catch (error) {
            console.error('Error deleting ubication with ID:', ubicationId, error);
        }
    }
    createdUbicationIds = [];
};

module.exports = { createUbications, deleteUbications, getCreatedUbicationIds: () => createdUbicationIds };

