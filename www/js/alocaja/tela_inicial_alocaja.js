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

        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            util.return_last_page();
        }, false);


        $("#btnVoltar").click(function () {
            util.return_last_page();
        });

        $("#btnIniciar").click(function () {
            util.showServiceMessage('Código de Barras', 'Código Inválido. Por favor tente novamente');

        });
        $("#btnTesteChamada").click(function () {
            app.showServiceMessage('Novo Serviço', 'Aceitar serviço?');

        });
        document.entregas =[];
        app.load_entregas();
        let cont = 1;
       setInterval(function () {
           cordova.plugins.notification.local.schedule({
               id: cont++,
               title: 'My first notification' + cont,
               text: 'Thats pretty easy...' + cont,
               foreground: true,
               badge: 1,
           });
        }, 5000);




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


    load_entregas: function(){

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (entregas) {
            coreDialog.close('.preloader');
            console.log(entregas);
            $.each(entregas, function (i, n) {
                 document.entregas.push(n);
            });
            app.load_entregas_to_grid();
        }

        let error = function (msg) {
            app.load_entregas_to_grid();
            coreDialog.close('.preloader');
            console.log(msg);
        }

        let data = {cnpj: 88888888888888};
        console.log("LEGAL")
        navigator.notification.alert("legal")
        alocaja_webservice_access.get_entregas_dinamicas(beforeSend, success, error);

    },

    load_entregas_to_grid: function(){

        console.log(document.entregas);
        $.each(document.entregas, function (i, item) {

            //var data_criacao_entrega =  moment(item.dataCriacaoEntrega).format('DD/MM/YYYY HH:mm');
            var destino = item.notas.length > 0 ? `${item.notas[0].bairro_cliente}, ${item.notas[0].cidade_cliente}` : '';
            let row = `<li id="${i}" onclick="document.onClickGrid(this);"  class="list-item with-second-label ${(i % 2 ? 'bg-gray-50' : '')}">` +
                            `<div class="row">` +
                                    `<div class="cell" style="min-width: 70px;"><span  class="fa-2x fa fa-truck-moving fg-purple-300"></span></div>` +
                                    `<div class="cell">` +
                                        `<div class="row"><div class="cell"><span class="label" id="nota">Destino: ${destino}</span></div></div>` +
                                        `<div class="row"><div class="cell"><span class="second-label" id="data_hora">Data e Hora: ${item.dataCriacaoEntrega}</span></div></div>` +
                                        `<div class="row"><div class="cell"><span class="label" id="nota">Valor Corrida: ${item.valorCorrida}</span></div></div>` +
                                        `<div class="row"><div class="cell"><span class="label" id="nota">Previsão KM: ${item.previsaoKilometragem}</span></div></div>` +
                                        `<div class="row"><div class="cell"><span class="second-label" id="data_hora">${item.statusEntrega}</span></div></div>` +
                                    `</div>` +
                             `</div>` +
                        `</li>`;

            $("#lista_entregas").append(row);

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
