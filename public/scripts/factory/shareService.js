"use strict";

(function() {
    angular.module("rfpApp").factory('shareService', function($resource) {
        var actions = {
            'get': {
                method: 'GET'
            },
            'save': {
                method: 'POST'
            },
            'query': {
                method: 'GET',
                isArray: true
            },
            'update': {
                method: 'PUT'
            },
            'delete': {
                method: 'DELETE'
            }
        };
        return $resource("rfp", {
            id: '@id'
        }, actions);
    });
})();
