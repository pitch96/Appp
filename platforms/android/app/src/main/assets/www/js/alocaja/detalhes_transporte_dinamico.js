/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },

    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },


    onDeviceReady: function () {
          var intervaloLocation = parseInt(window.localStorage.getItem("geo-loc-time"));
        intervaloLocation = intervaloLocation * 1000;
        setInterval(webservice_access.getLocationAndSendData, intervaloLocation);

        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            util.return_last_page();
        }, false);

 var mapOptions = {
                     center: {"lat":-23.6028967,"lng":-46.7823043},
                     zoom: 8,
                     zoomControl: false,
                     mapTypeControl: false
    };

        var canvas = $('#map-canvas');
        app.map = new google.maps.Map(canvas[0], mapOptions);


        var fgGeo = window.navigator.geolocation;
        fgGeo.getCurrentPosition(function(location) {
            var map     = app.map,
                coords  = location.coords,
                ll      = new google.maps.LatLng(coords.latitude, coords.longitude),
                zoom    = map.getZoom();

        /*    map.setCenter(ll);
            if (zoom < 15) {
                map.setZoom(15);
            }*/


            });



        $(document).ready(function () {

            coreProgress.showPreloader(undefined, 0);
            util.getCurrentGeoLocation(function (position) {
                document.current_position = position;

            document.posicoes =[];
            app.load_notas_transporte_agendado();
            var transporte =  JSON.parse(window.localStorage.getItem("transporte"));
           for (let i =0;i< transporte.notas.length;i++){
             app.pickLocation(transporte.notas[i].endereco , false)
           }
           app.pickLocation(transporte.endereco_centro, true)



            screen.orientation.lock('portrait');



                $("#codigo").html(transporte.codigo);
                $("#centro").html(transporte.centro);
                $("#preco").html(transporte.preco);
                $("#pesoTotal").html(transporte.pesoTotal);

                $("#btnVoltar").click(function () {
                    util.return_last_page();
                })


                $("#btnIniciarTransporte").click(function () {
                    navigator.notification.confirm('Você deseja iniciar este transporte agendado?',
                        function (e) {
                            if (e == 1) {
                                var transporte =  JSON.parse(window.localStorage.getItem("transporte"));
                                console.log("TRANSPORTE");
                                console.log(JSON.stringify(transporte))
                                app.iniciar_transporte_agendado(transporte.transporte_id);

                            }
                        }, 'Confirmar Inicio do Transporte', 'SIM,Cancelar');
                })

                coreDialog.close('.preloader');
            }, function (error) {
                coreDialog.close('.preloader');
                console.log(error);
            });

        });
    },




  pickLocation: function(address, centro){
  console.log("pickLocation")
  console.log(address)
  var loca;
          var geocoder = new google.maps.Geocoder();
               geocoder.geocode({'address': address}, function(results, status) {
                       if (status === 'OK') {
                         app.setMarkersOnMap(results[0].geometry.location,centro)
                       } else {
                         alert('Geocode was not successful for the following reason: ' + status);
                       }
                     });
   },


  setMarkersOnMap: function(locationCoord,centro) {
    var locationLocal = JSON.stringify(locationCoord);
    var str = JSON.stringify(locationCoord);
    var cord = JSON.parse(str);
    if (centro == true){
        app.location = new google.maps.Marker({
                 map: app.map,
                 icon: {
                     path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                     scale: 5,
                     fillColor: 'purple',
                     strokeColor: 'purple',
                     strokeWeight: 5
                 },
                 position: new google.maps.LatLng(cord.lat,cord.lng)
             });

    } else {
        app.location = new google.maps.Marker({
                 map: app.map,
                 icon: {
                     path: google.maps.SymbolPath.CIRCLE,
                     scale: 6,
                     fillColor: 'blue',
                     strokeColor: 'blue',
                     strokeWeight: 8
                 },
                 position: new google.maps.LatLng(cord.lat,cord.lng)
             });
    }

    var transporte =  JSON.parse(window.localStorage.getItem("transporte"));
    document.posicoes.push({"lat" :cord.lat, "lng": cord.lng});
    if (document.posicoes.length == transporte.notas.length+1){
       app.ajustarMapa()
    }
  },

  ajustarMapa: function(){
    var bounds = new google.maps.LatLngBounds();

   $.each(document.posicoes, function (i, item) {
          bounds.extend(new google.maps.LatLng(item.lat,item.lng));
   });

   app.map.fitBounds(bounds);
  },

    iniciar_transporte_agendado: function(transporte_id){
    console.log("iniciar_transporte_agendado")

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
            if (msg.success == 'true') {
                navigator.notification.alert("Transporte Agendado iniciado com sucesso!!", null, "Sucesso!", 'OK');
                console.log("iniciar_transporte_agendado2")

                //redirecionado para a pagina de notas iniciadas, e alterando o caminho que o usuario percorreu
                var breadcrumb = [{"url" : "index.html"}];
                util.save_breadcrumb(breadcrumb);
                window.location = '../notas_iniciadas_usuario.html';
            }else{
            console.log("iniciar_transporte_agendado3")


                navigator.notification.alert(msg.message, null, "Atenção!", 'OK');
                $('#btnVoltar').click();
            }

        }

        let error = function (msg) {
            console.log("iniciar_transporte_agendado4")

            coreDialog.close('.preloader');
            console.log(JSON.stringify(msg));
        }

        var formData = new FormData();

        formData.append('transporte', transporte_id);

        var latitude = '', longitude = '';
        if(document.current_position != null){
            latitude = document.current_position.coords.latitude;
            longitude = document.current_position.coords.longitude;
        }

        formData.append('latitude', latitude);
        formData.append('longitude',longitude);
        formData.append('usuario', window.localStorage.getItem("login"));
        console.log("AAAAAAAAAA")
           for (var pair of formData.entries()) {
                   console.log(pair[0] + ", " + pair[1]);
                 }
        webservice_access.iniciar_transporte_agendado(formData, beforeSend, success, error);

    },

    load_notas_transporte_agendado: function(){

        var transporte =  JSON.parse(window.localStorage.getItem("transporte"));
        document.notas = transporte.notas;

        $.each(document.notas, function (i, item) {

/*
            var data_checkin =  moment(item.data_checkin).format('DD/MM/YYYY');
*/

            let row = '<li id="' + i + '" onclick="document.onClickGrid(this);" class="list-item with-second-label ' +(i % 2 ? 'bg-gray-50' : '' ) + '">' +
                '<span class="label" id="data_hora">Endereço: ' + item.endereco + '</span>' +
                '<span class="second-label" id="nota">NF-E / OS: ' + item.num_nfe + ' Série: ' + item.serie_nfe  + '</span></li>' ;
/*
                '<span class="second-label" id="nota">Endereço: ' + item.endereco + '</span></li>';
*/
;
            $("#lista_notas").append(row);
        });

    },

};
