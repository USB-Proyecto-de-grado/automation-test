const supertest = require('supertest');
const expect = require('chai').expect;
const config = require('../../../config');
const request = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createMiscPublicationEntries, deleteMiscPublicationEntries, getCreatedMiscPublicationIds, getCreatedUserId } = require('../hooks/miscPublicationController/miscPublicationHooks');

describe('Miscellaneous Publication API Test - POST Requests', () => {

    before(async () => {
        await createTestUser();
    });

    after(async () => {
        await deleteMiscPublicationEntries();
        await deleteTestUser();
    });

    it('TC-47: Verify Successful Creation of Miscellaneous Publication Entry with All Required Fields Provided', async () => {
        const miscPublication = {
            title: 'New Misc Publication',
            description: 'Description for the new misc publication',
            fileUrl: 'http://file.url/new',
            isPublished: true,
            publicationDate: '2020-12-05',
            userId: getCreatedUserId()
        };
        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json')
                                      .set('Content-Type', 'application/json');
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('title', miscPublication.title);
        expect(response.body).to.have.property('description', miscPublication.description);
        expect(response.body).to.have.property('fileURL', miscPublication.fileURL);
        expect(response.body).to.have.property('isPublished', miscPublication.isPublished);
        expect(response.body).to.have.property('publicationDate', miscPublication.publicationDate);
        expect(response.body).to.have.property('userId', miscPublication.userId);
    });

    it('TC-55: Verify Correct Data Storage for Created Miscellaneous Publication With Special Characters', async () => {
        const miscPublication = {
            title: 'Título con caracteres especiales: !@#$%^&*()_+',
            description: 'Descripción con caracteres especiales: !@#$%^&*()_+',
            fileUrl: 'http://file.url/special-chars',
            isPublished: true,
            publicationDate: '2020-12-05',
            userId: getCreatedUserId()
        };
        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('title', miscPublication.title);
        expect(response.body).to.have.property('description', miscPublication.description);
        expect(response.body).to.have.property('fileURL', miscPublication.fileURL);
        expect(response.body).to.have.property('isPublished', miscPublication.isPublished);
        expect(response.body).to.have.property('publicationDate', miscPublication.publicationDate);
        expect(response.body).to.have.property('userId', miscPublication.userId);
    });

    it('TC-48: Verify Response When Title Field is Missing in the Miscellaneous Publication Request', async () => {
        const miscPublication = {
            description: 'Description for the new misc publication',
            fileUrl: 'http://file.url/new',
            isPublished: true,
            publicationDate: '2020-12-05',
            userId: getCreatedUserId()
        };
        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-49: Verify Response When Description Field is Missing in the Miscellaneous Publication Request', async () => {
        const miscPublication = {
            title: 'New Misc Publication',
            fileUrl: 'http://file.url/new',
            isPublished: true,
            publicationDate: '2020-12-05',
            userId: getCreatedUserId()
        };
        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-50: Verify Response When File URL is Invalid in the Miscellaneous Publication Request', async () => {
        const miscPublication = {
            title: 'New Misc Publication',
            description: 'Description for the new misc publication',
            fileUrl: 'invalid-url',
            isPublished: true,
            publicationDate: '2020-12-05',
            userId: getCreatedUserId()
        };
        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-51: Verify Response When isPublished Field is Missing in the Miscellaneous Publication Request', async () => {
        const miscPublication = {
            title: 'New Misc Publication',
            description: 'Description for the new misc publication',
            fileUrl: 'http://file.url/new',
            publicationDate: '2020-12-05',
            userId: getCreatedUserId()
        };
        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-52: Verify Response When Publication Date is in an Incorrect Format in the Miscellaneous Publication Request', async () => {
        const miscPublication = {
            title: 'New Misc Publication',
            description: 'Description for the new misc publication',
            fileUrl: 'http://file.url/new',
            isPublished: true,
            publicationDate: 'invalid-date',
            userId: getCreatedUserId()
        };
        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-53: Verify Response When UserID Field is Missing in the Miscellaneous Publication Request', async () => {
        const miscPublication = {
            title: 'New Misc Publication',
            description: 'Description for the new misc publication',
            fileUrl: 'http://file.url/new',
            isPublished: true,
            publicationDate: '2020-12-05'
        };
        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
    });

    it('TC-54: Verify System Behavior and Response When Duplicate Miscellaneous Publication Entry is Submitted', async () => {
        const miscPublication = {
            title: 'Duplicate Misc Publication',
            description: 'Description for the duplicate misc publication',
            fileUrl: 'http://file.url/duplicate',
            isPublished: true,
            publicationDate: '2020-12-05',
            userId: getCreatedUserId()
        };
        await request.post('/miscPublication')
                     .send(miscPublication)
                     .set('Accept', 'application/json')
                     .expect(201);

        const response = await request.post('/miscPublication')
                                      .send(miscPublication)
                                      .set('Accept', 'application/json');
        expect(response.status).to.equal(409);
        expect(response.body).to.have.property('error');
    });
});
