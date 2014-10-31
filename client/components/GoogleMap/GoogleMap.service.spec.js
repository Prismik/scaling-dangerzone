'use strict';

describe('Service: GoogleMap', function () {

  // load the service's module
  beforeEach(module('sigApp'));

  // instantiate service
  var GoogleMap;
  beforeEach(inject(function (_GoogleMap_) {
    GoogleMap = _GoogleMap_;
  }));

  it('should do something', function () {
    expect(!!GoogleMap).toBe(true);
  });

});
