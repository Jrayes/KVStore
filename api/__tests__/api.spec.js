const request = require('request');
const endpoint = 'http://localhost:6000/';
const mockServer = require('../../mock');

describe("Component tests for kv store", function() {
    var serverInstance;

    beforeAll(function (done) {

        serverInstance = mockServer.run(done);
        console.log(mockServer);
    });
    
    afterAll(function (done) {
        serverInstance.close(done);
    });

    it('should get with no items stored yet.', function (done) {

    request.get(endpoint + 'store', function (error, response, body) {
        expect(error).toEqual(null);
        expect(response.statusCode).toEqual(200);
        expect(body).toEqual(JSON.stringify({}));
        done();
    });

});

it('should not be able to search for a particular resource(404).', function (done) {

    request({method: 'get', uri: endpoint + 'search'}, function (error, response, body) {
        expect(error).toEqual(null);
        expect(response.statusCode).toEqual(404);
        done();
    });

});


    it('should sucessfully post with request body', function (done) {

        request({method: 'post', uri: endpoint + 'store', json: {key:'Person', value: 'Mark'}}, function (error, response, body) {
            expect(error).toEqual(null);
            expect(response.statusCode).toEqual(201);
            done();
        });
});


    it('should retrieve results after creating a resource.', function (done) {

        request({method: 'post', uri: endpoint + 'store', json: {key:'Person', value: 'Mark'}}, function (error, response, body) {
            expect(error).toEqual(null);
            expect(response.statusCode).toEqual(201);
            done();
        });
    });


    it('should be able to search for a particular resource.', function (done) {

        request({method: 'get', uri: endpoint + 'search?searchtext=Person'}, function (error, response, body) {
            expect(error).toEqual(null);
            expect(response.statusCode).toEqual(200);
            done();
        });
    });


});
