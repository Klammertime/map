$(function() {
    var googleMap,
        geocoder,
        map;

    // Location construction
    var Scene = function() {
        this.filmLocation = ko.observable();
        this.filmTitle = ko.observable();
        this.year = ko.observable();
        this.director = ko.observable();
        this.productionCompany = ko.observable();
        this.writer = ko.observable();
        this.latLng = null;
        this.latLng = null;
        this.description = null;
        this.wikipedia = null;
        this.flickr = null;
        this.nyTimes = null;
        this.review = null;
    };

    ko.bindingHandlers.googleMap = {
        init: function(element, valueAccessor) {
            var myLatLng = new google.maps.LatLng(37.77493, -122.419416);
            var mapOptions = {
                center: myLatLng,
                zoom: 13,
                disableDefaultUI: true,
                zoomControl: true,
                panControl: true,
                scaleControl: true,
                streetViewControl: true,
                rotateControl: true,
                overviewMapControl: true,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var initialCenter = mapOptions.center;
            var initialZoom = mapOptions.zoom;
            map = new google.maps.Map(element, mapOptions);

            addGoToInitialExtent(map, initialCenter, initialZoom);

            google.maps.event.addDomListener(map, 'idle', function() {
                center = map.getCenter();
            });

            // when right click, go back to initial center
            function addGoToInitialExtent(map, initialCenter, initialZoom) {
                google.maps.event.addListener(map, 'rightclick', function() {
                    map.setCenter(initialCenter);
                    map.setZoom(initialZoom);
                });
            }
        },
        update: function(element, valueAccessor, allBindings) {
            window.addEventListener('resize', (function() {
                map.setCenter(center);
            }), false);
            google.maps.event.addDomListener(map, 'click', function() {
                center = map.getCenter();
            });
        }
    };

    my.vm = function() {
        var metadata = {},
            scenes = ko.observableArray([]),
            currentScenes = ko.observableArray([]), //put current selected film locs
            selectedScenes = ko.observableArray([]),
            favoritedScenes = ko.observableArray([]),
            allTitles = ko.observableArray([]),
            selectedFilm = ko.observableArray([]),
            singleFilm = ko.observable('180'),
            newFilm = ko.observable(true);
            var markers = [],

            load = function() {
                $.each(my.filmData.data.Scenes, function(i, p) {
                    scenes.push(new Scene()
                        .filmLocation(p.film_location + ", San Francisco, CA")
                        .filmTitle(p.film_title)
                        .year(p.release_year)
                        .director(p.director)
                        .productionCompany(p.production_company)
                        .writer(p.writer)
                    );
                    allTitles.push(p.film_title);
                });
            },

            uniqueTitles = ko.computed(function() {
                return ko.utils.arrayGetDistinctValues(allTitles().sort());
            }),

          checkReset = function(){
            console.log("checkReset is running from codeAddress");
            if(markers.length > 0){
              for(var j = 0; j < markers.length; j++){
                my.vm.markers[j].setMap(null);
              }
              my.vm.currentScenes([]);
            }
          },

          codeAddress = function() {
            console.log("I'm running!!");
            this.checkReset();
            var address;
            console.log("address in codeAddress", address);
            var geocoder = new google.maps.Geocoder();
            var prev_infowindow = false;

            function masterGeocoder(geocodeOptions1){
               geocoder.geocode(geocodeOptions1, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            map.setCenter(results[0].geometry.location);

                            var contentString = '<div id="content"><p>' +
                                results[0].formatted_address + '</p></div>';

                            var infowindow = new google.maps.InfoWindow({
                                content: contentString,
                                maxWidth: 400
                            });

                            // this adds a marker to the map
                            var marker = new google.maps.Marker({
                                map: map,
                                position: results[0].geometry.location,
                                title: results[0].formatted_address,
                                animation: google.maps.Animation.DROP
                            });


                            marker.addListener('click', function() {
                                if (prev_infowindow) {
                                    prev_infowindow.close();
                                }

                                prev_infowindow = infowindow;
                                infowindow.open(map, marker);
                            });

                            markers.push(marker);

                        } else {
                            console.log("Geocode was not successful for the following reason: " + status);
                        }
                    });
            }

            for (var i = 0; i < this.scenes().length; i++) {
              console.log("value of singleFilm() from for loop inside codeAddress", singleFilm());
                if (singleFilm() == my.vm.scenes()[i].filmTitle()) {
                    address = my.vm.scenes()[i].filmLocation();
                    currentScenes.push(address);
                    var geocodeOptions = {
                        address: address,
                        componentRestrictions: {
                            country: 'US'
                        }
                    };
                    masterGeocoder(geocodeOptions);
                }
            }
          };




        return {
            scenes: scenes,
            selectedScenes: selectedScenes,
            load: load,
            uniqueTitles: uniqueTitles,
            allTitles: allTitles,
            selectedFilm: selectedFilm,
            singleFilm: singleFilm,
            newFilm: newFilm,
            codeAddress: codeAddress,
            currentScenes: currentScenes,
            markers: markers,
            checkReset: checkReset
        };
    }();


    my.vm.load();


          // my.vm.singleFilm.subscribe(function() {
          //   my.vm.codeAddress();
          // }, my.vm);


    ko.applyBindings(my.vm);

});