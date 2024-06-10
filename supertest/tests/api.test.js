const supertest = require('supertest');
const expect = require('chai').expect;
const request = supertest('https://jsonplaceholder.typicode.com');

describe('API Test Example', () => {
  it('GET /posts/1 - returns a post', async () => {
    const response = await request.get('/posts/1');
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('id', 1);
  });
});
