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
    closeServiceTimeout: null,
    audioSkype: null,

    // Application Constructor
    initialize: function () {
        this.bindEvents();
        app.audioSkype = new Audio('../assets/audio/skype_call.mp3');
        app.audioSkype.loop = true;
    },


    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },


    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
          var intervaloLocation = parseInt(window.localStorage.getItem("geo-loc-time"));
        intervaloLocation = intervaloLocation * 1000;
        setInterval(webservice_access.getLocationAndSendData, intervaloLocation);

        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            util.return_last_page();
        }, false);


            $(document).ready(function (e) {
               app.loadCentros();

                /*   document.onClickGrid = function onClickGrid (e){
                      console.log("legal pra caraaaai")
                console.log(JSON.stringify(e))
                   }
*/

                   $("#btnVoltar").click(function () {
                       util.return_last_page();
                    })

               });
                   $("#btnVoltar").click(function () {
                           util.return_last_page();
                       });

      $("#btnFiltrar").click(function () {
         util.add_path_to_breadcrumb('tela_filtro_viagens_abertas_alocaja.html');

            window.location = 'tela_viagens_abertas_alocaja.html';
        });
      $("#btnVerTodasViagens").click(function () {
         util.add_path_to_breadcrumb('tela_filtro_viagens_abertas_alocaja.html');
/*         window.localStorage.removeItem("filter_alocaja_cnpj");
         window.localStorage.removeItem("filter_alocaja_peso");*/
         window.location = 'tela_viagens_abertas_alocaja.html';
        });
        $("#btnIniciar").click(function () {
            util.showServiceMessage('Código de Barras', 'Código Inválido. Por favor tente novamente');

        });
        $("#cnpj").change(function (e) {
        console.log("valores cnpj")
        console.log(Number(e.target.value))
          window.localStorage.setItem("filter_alocaja_cnpj", Number(e.target.value));

         });
         $("#pesoMaximo").change(function (e) {
         window.localStorage.setItem("filter_alocaja_peso", e.target.value);
         });


        document.entregas =[];





        cordova.plugins.notification.local.on("click", function (notification) {
            alert('ok');
        });

    },

    showServiceMessage: function (title = '', message = '') {

        app.setLocationOnMap("Rua Capitão Pacheco e Chaves, 313 - Mooca, São Paulo");
        coreDialog.open('#dialogProcessMessage');
        $('#process-message-title').html(title);
        $('#process-message-text').html(message);
        $('#origem-text').html("Origem: Mooca-SP");
        $('#destino-text').html("Destino: Freguesia do Ó-SP");
        $('#valor-text').html("Valor da corrida: R$ 560,00");


        $('#process-message').attr('src', '../img/process-success.gif');
        app.playRingingAudio();
        app.closeServiceTimeout = setTimeout(function () {
            app.closeServiceCallScreen();
        }, 30000);
        app.closeServiceTimeout();
    },


    closeServiceCallScreen: async function () {
        clearTimeout(app.closeServiceTimeout);
        app.stopRingingAudio();
        coreDialog.close('#dialogProcessMessage');
    },

    acceptService: function () {
        clearTimeout(app.closeServiceTimeout);
        app.stopRingingAudio();
        coreDialog.close('#dialogProcessMessage');

    },

    playRingingAudio: function() {
        app.audioSkype.play();
    },
    stopRingingAudio: async function() {
        app.audioSkype.currentTime = 0;
        await app.audioSkype.pause();
    },

    loadInputValues: function(){
    window.localStorage.removeItem("filter_alocaja_cnpj")
    document.getElementById('pesoMaximo').value = window.localStorage.getItem("filter_alocaja_peso") != null && window.localStorage.getItem("filter_alocaja_peso") != "" ? window.localStorage.getItem("filter_alocaja_peso") : ""
    },

    loadCentros: function(){
        console.log("loadCentros")

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
         console.log(JSON.stringify(msg))

            coreDialog.close('.preloader');
            if (msg.success == 'true') {
                app.load_centros_options(msg.centros);
                app.loadInputValues();
            }
        }

        let error = function (msg) {
                console.log("error")
        console.log(JSON.stringify(msg))


            coreDialog.close('.preloader');
            console.log(msg);
        }


        webservice_access.get_centros(beforeSend, success, error);

    },
    load_centros_options : function(centros){
        $.each(centros, function (i, item) {
            $("#cnpj").append(new Option(item.nome_centro, item.cnpj));
        });
    },



    setLocationOnMap: function(address) {


        let geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            'address': address
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var myOptions = {
                    zoom: 15,
                    zoomControl: false,
                    mapTypeControl: false,
                    center: results[0].geometry.location,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                }
                let map = new google.maps.Map($('#map-canvas')[0], myOptions);


                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 3,
                        fillColor: 'blue',
                        strokeColor: 'blue',
                        strokeWeight: 5
                    },
                });
            }
        });
    },
  setLocationOnMap: function(address) {


        let geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            'address': address
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var myOptions = {
                    zoom: 15,
                    zoomControl: false,
                    mapTypeControl: false,
                    center: results[0].geometry.location,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                }
                let map = new google.maps.Map($('#map-canvas')[0], myOptions);


                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 3,
                        fillColor: 'blue',
                        strokeColor: 'blue',
                        strokeWeight: 5
                    },
                });
            }
        });
    },
};
