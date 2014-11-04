'use strict';

angular.module('sigApp')
  .factory('Modal', function ($rootScope, $modal) {
    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $modal.open() returns
     */
    function openModal(scope, modalClass) {
      var modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';
      angular.extend(modalScope, scope);

      return $modal.open({
        templateUrl: 'components/modal/modal.html',
        windowClass: modalClass,
        scope: modalScope
      });
    }

    function openForm(modalScope, scope, modalClass) {
      scope = scope || {};
      modalClass = modalClass || 'modal-default';
      angular.extend(modalScope, scope);

      return $modal.open({
        templateUrl: 'components/modal/modalForm.html',
        windowClass: modalClass,
        scope: modalScope
      });
    }

    // Public API here
    return {

      /* Confirmation modals */
      confirm: {

        /**
         * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} del - callback, ran when delete is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        delete: function(del) {
          del = del || angular.noop;

          /**
           * Open a delete confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed staight to del callback
           */
          return function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift(),
                deleteModal;

            deleteModal = openModal({
              modal: {
                dismissable: true,
                title: 'Confirm Delete',
                html: '<p>Are you sure you want to delete <strong>' + name + '</strong> ?</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: 'Delete',
                  click: function(e) {
                    deleteModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    deleteModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            deleteModal.result.then(function(event) {
              del.apply(event, args);
            });
          };
        }
      },
      /* Form modals */
      form : {
        add: function(add) {
          add = add || angular.noop;

          return function() {
            var args = Array.prototype.slice.call(arguments),
                modalClass = args.shift(),
                name = args.shift(),
                addModal;


            var modalScope = $rootScope.$new();
            modalScope.form = { };
            for (var i = 0; i != args.length; ++i) {
              modalScope.form[args[i]] = '';
            }
            addModal = openForm(modalScope, {
              modal: {
                dismissable: true,
                title: 'Add ' + name + "...",
                fields: args,
                buttons: [{
                  classes: 'btn-success',
                  text: 'Add',
                  click: function(e) {
                    addModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    addModal.dismiss(e);
                  }
                }],
              }
            }, modalClass);

            addModal.result.then(function() {
              var arr = modalScope.form;
              add.call(undefined, arr);
            });
          }
        }
      }
    };
  });
