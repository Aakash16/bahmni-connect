'use strict';

angular.module('opd.activePatientsListController', ['opd.patientsListService', 'opd.patientService','infinite-scroll'])
    .controller('ActivePatientsListController', ['$route', '$scope', '$location', 'PatientsListService', 'PatientService', function ($route, $scope, $location, patientsListService, patientService) {
        $scope.getActivePatientList = function () {
        var queryParameters = $location.search();

        patientsListService.getActivePatients(queryParameters).success(function (data) {
            data.forEach(function (datum) {
                datum.image = patientService.constructImageUrl(datum.identifier);
            });
            $scope.activePatientsList = data;
            $scope.searchPatientList = $scope.activePatientsList;

            $scope.storeWindowDimensions();
            $scope.visiblePatientsList= $scope.searchPatientList.slice(0,$scope.tilesToFit);

        });
    }

    $scope.loadMore = function() {
        if($scope.visiblePatientsList !== undefined){
            var last = $scope.visiblePatientsList.length - 1;
            if(last <= $scope.searchPatientList.length ){
                for(var i = 1; i <=$scope.tilesToLoad ; i++) {
                    $scope.visiblePatientsList.push($scope.searchPatientList[i+last]);
                }
            }
        }
    };

    $scope.getActivePatientList();

    $scope.matchesNameOrId = function(patient){
        if(patient !== undefined && patient.name !== undefined && patient.identifier !== undefined ){
            if($scope.searchParameter === undefined){
                return true;
            }
            if(patient.name.toLowerCase().search($scope.searchParameter.toLowerCase()) >=0
                || patient.identifier.toLowerCase().search($scope.searchParameter.toLowerCase()) >= 0){
                return true;
            }

        }
        return false;
    };

    $scope.filterPatientList =     function () {
        var searchList = [];
        $scope.activePatientsList.forEach(   function(item){
            if($scope.matchesNameOrId(item))  {
                searchList.push(item);
            }
        })
        $scope.searchPatientList = searchList;
        $scope.visiblePatientsList= $scope.searchPatientList.slice(0,$scope.tilesToFit);
    }

    $scope.storeWindowDimensions = function(){
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        var tileWidth = constants.patientTileWidth;
        var tileHeight = constants.patientTileHeight;
        $scope.tilesToFit = Math.ceil(windowWidth * windowHeight / (tileWidth * tileHeight));
        $scope.tilesToLoad =  Math.ceil($scope.tilesToFit*constants.tileLoadRatio);
    }

 }]).directive('resize', function ($window) {
        return function (scope,element) {

            scope.storeWindowDimensions();


            angular.element($window).bind('resize', function () {
                scope.$apply(function () {
                    scope.storeWindowDimensions();
                    scope.visiblePatientsList= scope.searchPatientList.slice(0,scope.tilesToFit);
                });
            });
        };
    });;

